import {
  UseGuards,
  Controller,
  Logger,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Role, TableStatus } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableService } from './table.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Table Management')
@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TableController {
  private readonly logger = new Logger(TableController.name);
  constructor(private readonly tableService: TableService) { }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new table (Admin/Manager only)' })
  create(@Body() createTableDto: CreateTableDto, @Req() req) {
    this.logger.log(
      `User ${req.user.email} creating table: ${createTableDto.tableNumber}`,
    );
    return this.tableService.create(createTableDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  @ApiQuery({
    name: 'status',
    enum: TableStatus,
    required: false,
    description: 'Filter by table status',
  })
  @ApiQuery({
    name: 'minCapacity',
    type: Number,
    required: false,
    description: 'Filter by minimum capacity',
  })
  findAll(
    @Req() req,
    @Query('status') status?: TableStatus,
    @Query('minCapacity') minCapacity?: string, // Swagger sends as string
  ) {
    return this.tableService.findAll(
      status,
      minCapacity ? parseInt(minCapacity, 10) : undefined,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific table by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const table = await this.tableService.findOne(id);
    if (!table) throw new NotFoundException(`Table with ID '${id}' not found.`);
    return table;
  }

  @Get('number/:tableNumber')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER)
  @ApiOperation({ summary: 'Get a specific table by table number' })
  @ApiParam({
    name: 'tableNumber',
    type: String,
    description: 'The unique table number (e.g., T1, A5)',
  })
  async findByTableNumber(
    @Param('tableNumber') tableNumber: string,
    @Req() req,
  ) {
    this.logger.log(
      `User ${req.user.email} fetching table by number: ${tableNumber}`,
    );
    const table = await this.tableService.findByTableNumber(tableNumber);
    if (!table)
      throw new NotFoundException(
        `Table with number '${tableNumber}' not found.`,
      );
    return table;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a table (Admin/Manager only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
    @Req() req,
  ) {
    this.logger.log(`User ${req.user.email} updating table ID: ${id}`);
    return this.tableService.update(id, updateTableDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Only Admin can delete tables
  @ApiOperation({ summary: 'Delete a table (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} deleting table ID: ${id}`);
    return this.tableService.remove(id);
  }
}
