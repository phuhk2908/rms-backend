import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Staff, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  private readonly saltRounds = 10;

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createStaffDto: CreateStaffDto,
  ): Promise<Omit<Staff, 'password'>> {
    this.logger.log(
      `Attempting to create staff with email: ${createStaffDto.email}`,
    );
    const { email, password, name, role } = createStaffDto;

    const existingStaff = await this.prisma.staff.findUnique({
      where: { email },
    });
    if (existingStaff) {
      this.logger.warn(`Staff creation failed: Email ${email} already exists.`);
      throw new ConflictException(
        `Staff with email '${email}' already exists.`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    this.logger.debug(`Password hashed for email: ${email}`);

    try {
      const newStaff = await this.prisma.staff.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || Role.WAITER,
        },
      });
      this.logger.log(
        `Staff created successfully: ${newStaff.email} (ID: ${newStaff.id})`,
      );
      const { password: _, ...result } = newStaff;
      return result;
    } catch (error) {
      this.logger.error(`Error creating staff: ${error.message}`, error.stack);
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Staff with email '${email}' already exists (database constraint).`,
        );
      }
      throw new InternalServerErrorException(
        'Could not create staff member. Please try again later.',
      );
    }
  }

  async findAll(): Promise<Omit<Staff, 'password'>[]> {
    this.logger.log('Fetching all staff members.');
    const staffList = await this.prisma.staff.findMany();
    return staffList.map(({ password, ...staff }) => staff);
  }

  async findOne(id: string): Promise<Omit<Staff, 'password'> | null> {
    this.logger.log(`Fetching staff member with ID: ${id}`);
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) {
      this.logger.warn(`Staff member with ID: ${id} not found.`);
      return null;
    }
    const { password, ...result } = staff;
    return result;
  }

  async findOneByEmail(email: string): Promise<Staff | null> {
    this.logger.debug(`Fetching staff member by email (internal): ${email}`);
    const staff = await this.prisma.staff.findUnique({ where: { email } });
    if (!staff) {
      this.logger.debug(
        `Staff member with email: ${email} not found (internal).`,
      );
      return null;
    }
    return staff;
  }

  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<Omit<Staff, 'password'>> {
    this.logger.log(`Attempting to update staff member with ID: ${id}`);
    const { email, name, role, password: newPassword } = updateStaffDto;

    const staffToUpdate = await this.prisma.staff.findUnique({ where: { id } });
    if (!staffToUpdate) {
      this.logger.warn(`Update failed: Staff member with ID: ${id} not found.`);
      throw new NotFoundException(`Staff member with ID '${id}' not found.`);
    }

    if (email && email !== staffToUpdate.email) {
      const existingStaffWithNewEmail = await this.prisma.staff.findUnique({
        where: { email },
      });
      if (existingStaffWithNewEmail) {
        this.logger.warn(
          `Update failed: New email ${email} for staff ID ${id} already exists.`,
        );
        throw new ConflictException(
          `Staff with email '${email}' already exists.`,
        );
      }
    }

    let hashedPassword = staffToUpdate.password;
    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
      this.logger.debug(`New password hashed for staff ID: ${id}`);
    }

    try {
      const updatedStaff = await this.prisma.staff.update({
        where: { id },
        data: {
          email: email || staffToUpdate.email,
          name: name || staffToUpdate.name,
          role: role || staffToUpdate.role,
          password: hashedPassword,
        },
      });
      this.logger.log(`Staff member with ID: ${id} updated successfully.`);
      const { password, ...result } = updatedStaff;
      return result;
    } catch (error) {
      this.logger.error(
        `Error updating staff ID ${id}: ${error.message}`,
        error.stack,
      );
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Cannot update staff: the new email '${email}' may already be in use.`,
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Staff member with ID '${id}' not found during update operation.`,
        );
      }
      throw new InternalServerErrorException(
        'Could not update staff member. Please try again later.',
      );
    }
  }

  async remove(id: string): Promise<Omit<Staff, 'password'>> {
    this.logger.log(`Attempting to remove staff member with ID: ${id}`);
    try {
      const staffToDelete = await this.prisma.staff.delete({
        where: { id },
      });
      this.logger.log(`Staff member with ID: ${id} removed successfully.`);
      const { password, ...result } = staffToDelete;
      return result;
    } catch (error) {
      this.logger.error(
        `Error removing staff ID ${id}: ${error.message}`,
        error.stack,
      );
      if (error.code === 'P2025') {
        throw new NotFoundException(`Staff member with ID '${id}' not found.`);
      }
      throw new InternalServerErrorException(
        'Could not remove staff member. Please try again later.',
      );
    }
  }
}
