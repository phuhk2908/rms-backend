import { Controller, Get, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, NotFoundException, Post } from '@nestjs/common';
import { StaffService } from './staff.service';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateStaffDto } from './dto/create-staff.dto';

@ApiTags('Staff Management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiCookieAuth()
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo tài khoản nhân viên mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tài khoản đã được tạo thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại.' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.createByAdmin(createStaffDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhân viên (Admin/Manager only)' })
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Lấy thông tin một nhân viên theo ID (Admin/Manager only)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const staff = await this.staffService.findOne(id);
    if (!staff) {
      throw new NotFoundException(`Nhân viên với ID '${id}' không tồn tại.`);
    }
    return staff;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Cập nhật thông tin nhân viên (Admin/Manager only)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xóa một nhân viên (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.remove(id);
  }
}
