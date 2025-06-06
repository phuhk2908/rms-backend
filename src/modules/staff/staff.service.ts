import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Role, Staff } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) { }

  async createByAdmin(createStaffDto: CreateStaffDto): Promise<Omit<Staff, 'password'>> {
    const { email, password, name, role } = createStaffDto;
    const existingStaff = await this.prisma.staff.findUnique({ where: { email } });
    if (existingStaff) {
      throw new ConflictException(`Tài khoản với email '${email}' đã tồn tại.`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Admin có thể gán bất kỳ vai trò nào, nếu không gán sẽ mặc định là CUSTOMER
    const newStaff = await this.prisma.staff.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || Role.CUSTOMER, // Admin có thể gán vai trò
        isVerified: true, // Xác thực ngay lập tức
      },
    });

    this.logger.log(`Admin đã tạo tài khoản cho ${newStaff.email} (ID: ${newStaff.id}).`);
    const { password: _, ...result } = newStaff;
    return result;
  }

  // --- FIXED ---
  async findAll(): Promise<Omit<Staff, 'password'>[]> {
    this.logger.log('Fetching all staff members.');
    const staffList = await this.prisma.staff.findMany();
    // Chỉ loại bỏ trường "password"
    return staffList.map(({ password, ...staff }) => staff);
  }

  // --- FIXED ---
  async findOne(id: string): Promise<Omit<Staff, 'password'> | null> {
    this.logger.log(`Fetching staff member with ID: ${id}`);
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) {
      return null;
    }
    // Chỉ loại bỏ trường "password"
    const { password, ...result } = staff;
    return result;
  }

  async findOneByEmail(email: string): Promise<Staff | null> {
    this.logger.debug(`Fetching staff member by email (internal): ${email}`);
    return this.prisma.staff.findUnique({ where: { email } });
  }

  async update(id: string, dto: UpdateStaffDto): Promise<Omit<Staff, 'password'>> {
    const { password, ...data } = dto;
    if (password) {
      data['password'] = await bcrypt.hash(password, this.saltRounds);
    }
    try {
      const updatedStaff = await this.prisma.staff.update({
        where: { id },
        data,
      });
      // Chỉ loại bỏ trường "password"
      const { password: _, ...result } = updatedStaff;
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Nhân viên với ID '${id}' không tồn tại.`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Omit<Staff, 'password'>> {
    try {
      const deletedStaff = await this.prisma.staff.delete({ where: { id } });
      // Chỉ loại bỏ trường "password"
      const { password, ...result } = deletedStaff;
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Nhân viên với ID '${id}' không tồn tại.`);
      }
      throw error;
    }
  }
}