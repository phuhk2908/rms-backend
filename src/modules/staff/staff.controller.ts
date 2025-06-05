import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Logger,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StaffService } from './staff.service';
import { UpdateStaffDto } from './dto/update-staff.dto';

@ApiTags('Staff Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  private readonly logger = new Logger(StaffController.name);

  constructor(private readonly staffService: StaffService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get all staff members (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'List of all staff members.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role.' })
  findAll(@Req() req) {
    // Added @Req to access req.user for logging
    this.logger.log(
      `GET /staff - attempt to find all staff by user: ${req.user?.email || 'unknown (JWT valid, user details missing)'}`,
    );
    return this.staffService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get a specific staff member by ID (Admin/Manager only)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Staff member ID',
  })
  @ApiResponse({ status: 200, description: 'Staff member details.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role.' })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Staff member not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    // Added @Req
    this.logger.log(
      `GET /staff/${id} - attempt to find one staff by user: ${req.user?.email || 'unknown'}`,
    );
    const staff = await this.staffService.findOne(id);
    if (!staff) {
      throw new NotFoundException(`Staff member with ID '${id}' not found.`);
    }
    return staff;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a staff member (Admin/Manager only)' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Staff member ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role.' })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Staff member not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @Req() req,
  ) {
    // Added @Req
    this.logger.log(
      `PATCH /staff/${id} - attempt to update staff by user: ${req.user?.email || 'unknown'}`,
    );
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a staff member (Admin only)' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Staff member ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member deleted successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role.' })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Staff member not found.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    // Added @Req
    this.logger.log(
      `DELETE /staff/${id} - attempt to delete staff by user: ${req.user?.email || 'unknown'}`,
    );
    return this.staffService.remove(id);
  }
}
