import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Role as StaffRolePrisma } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStaffDto {
  @ApiPropertyOptional({
    example: 'updated.staff@example.com',
    description: 'New email address for the staff member',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address if provided.' })
  email?: string;

  @ApiPropertyOptional({
    example: 'NewSecureP@ss123!',
    description:
      'New password (min 8 characters). If not provided, password remains unchanged.',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: 'New password must be at least 8 characters long if provided.',
  })
  password?: string;

  @ApiPropertyOptional({
    example: 'Jane Doe',
    description: 'Updated full name of the staff member',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    enum: StaffRolePrisma,
    example: StaffRolePrisma.MANAGER,
    description: 'Updated role of the staff member',
  })
  @IsOptional()
  @IsEnum(StaffRolePrisma, {
    message: `Updated role must be one of: ${Object.values(StaffRolePrisma).join(', ')}`,
  })
  role?: StaffRolePrisma;
}
