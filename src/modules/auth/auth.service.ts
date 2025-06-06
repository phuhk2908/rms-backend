import { Injectable, UnauthorizedException, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StaffService } from '../staff/staff.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { Staff, Role } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly staffService: StaffService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) { }

  async registerCustomer(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, name } = registerDto;
    this.logger.log(`Yêu cầu đăng ký của khách hàng cho email: ${email}`);

    const existingStaff = await this.prisma.staff.findUnique({ where: { email } });
    if (existingStaff) {
      this.logger.warn(`Đăng ký thất bại: Email ${email} đã tồn tại.`);
      if (!existingStaff.isVerified) {
        throw new ConflictException(`Tài khoản với email '${email}' đã tồn tại nhưng chưa được xác thực.`);
      }
      throw new ConflictException(`Tài khoản với email '${email}' đã tồn tại.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiryDate = new Date(new Date().getTime() + 10 * 60000); // 10 phút

    const newStaff = await this.prisma.staff.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.CUSTOMER, // Mặc định vai trò là CUSTOMER
        isVerified: false,   // Cần xác thực email
        verificationToken: otp,
        verificationExpires: expiryDate,
      },
    });

    // Gửi email xác thực
    await this.emailService.sendAccountVerificationOtp(newStaff, otp);

    return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.' };
  }

  async validateStaff(email: string, pass: string): Promise<Omit<Staff, 'password'>> {
    const staff = await this.staffService.findOneByEmail(email);
    if (!staff) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (!staff.isVerified) {
      throw new UnauthorizedException('Account not verified. Please check your email for the verification OTP.');
    }
    const isPasswordMatching = await bcrypt.compare(pass, staff.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const { password, ...result } = staff;
    return result;
  }

  async login(loginDto: LoginDto) {
    const staff = await this.validateStaff(loginDto.email, loginDto.password);
    const payload = { sub: staff.id, email: staff.email, role: staff.role };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, staff };
  }

  async verifyAccount(verifyDto: VerifyAccountDto) {
    const { email, token } = verifyDto;
    this.logger.log(`Đang xác thực tài khoản cho email: ${email}`);
    const staff = await this.prisma.staff.findFirst({
      where: {
        email,
        verificationToken: token,
        verificationExpires: { gt: new Date() },
      },
    });
    if (!staff) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }
    await this.prisma.staff.update({
      where: { id: staff.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });
    return { message: 'Tài khoản của bạn đã được xác thực thành công.' };
  }

  async resendVerification(email: string) {
    this.logger.log(`Yêu cầu gửi lại mã xác thực cho email: ${email}`);
    const staff = await this.prisma.staff.findUnique({ where: { email } });
    if (!staff) {
      return { message: 'Nếu email tồn tại và chưa xác thực, mã OTP mới đã được gửi.' };
    }
    if (staff.isVerified) {
      throw new ConflictException('Tài khoản này đã được xác thực.');
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiryDate = new Date(new Date().getTime() + 10 * 60000); // 10 minutes
    await this.prisma.staff.update({
      where: { email },
      data: { verificationToken: otp, verificationExpires: expiryDate },
    });
    await this.emailService.sendAccountVerificationOtp(staff, otp);
    return { message: 'Nếu email tồn tại và chưa xác thực, mã OTP mới đã được gửi.' };
  }

  async forgotPassword(email: string) {
    this.logger.log(`Yêu cầu quên mật khẩu cho email: ${email}`);
    const staff = await this.prisma.staff.findUnique({ where: { email } });
    if (!staff) {
      return { message: 'Nếu email tồn tại, mã OTP đặt lại mật khẩu đã được gửi.' };
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiryDate = new Date(new Date().getTime() + 10 * 60000); // 10 minutes
    await this.prisma.staff.update({
      where: { email },
      data: { passwordResetToken: otp, passwordResetExpires: expiryDate },
    });
    await this.emailService.sendPasswordResetOtp(staff, otp);
    return { message: 'Nếu email tồn tại, mã OTP đặt lại mật khẩu đã được gửi.' };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const { email, token, password } = resetDto;
    this.logger.log(`Đang đặt lại mật khẩu cho email: ${email}`);
    const staff = await this.prisma.staff.findFirst({
      where: {
        email,
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!staff) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.staff.update({
      where: { id: staff.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }
}