import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StaffService } from '../staff/staff.service';
import * as bcrypt from 'bcrypt';
import { Staff, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

type SafeStaff = Omit<Staff, 'password'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly staffService: StaffService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateStaff(
    email: string,
    pass: string,
  ): Promise<Omit<Staff, 'password'> | null> {
    this.logger.debug(`Attempting to validate staff with email: ${email}`);
    const staff = await this.staffService.findOneByEmail(email);

    if (staff) {
      this.logger.debug(`Staff found: ${staff.email}, role: ${staff.role}`);
      const isPasswordMatching = await bcrypt.compare(pass, staff.password);
      if (isPasswordMatching) {
        this.logger.debug(`Password matches for staff: ${email}`);
        const { password, ...result } = staff;
        return result;
      } else {
        this.logger.warn(`Password mismatch for staff: ${email}`);
      }
    } else {
      this.logger.warn(`Staff not found with email: ${email}`);
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    const staff = await this.validateStaff(loginDto.email, loginDto.password);
    if (!staff) {
      this.logger.warn(
        `Unauthorized login attempt for email: ${loginDto.email}`,
      );
      throw new UnauthorizedException(
        'Invalid credentials. Please check email and password.',
      );
    }

    const payload: JwtPayload = {
      sub: staff.id,
      email: staff.email,
      role: staff.role,
    };
    this.logger.log(`Login successful for ${staff.email}, generating token.`);
    return {
      message: 'Login successful',
      accessToken: this.jwtService.sign(payload),
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
      },
    };
  }

  async verifyPayload(payload: JwtPayload): Promise<SafeStaff | null> {
    const staff = await this.staffService.findOne(payload.sub);
    if (!staff || staff.role !== payload.role) {
      return null;
    }

    return staff;
  }
}
