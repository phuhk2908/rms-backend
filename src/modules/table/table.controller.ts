import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   ParseUUIDPipe,
   Put,
   Delete,
   UseGuards,
} from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

import { UserRole } from '@shared/enums/user-role.enum';
import { TableStatus } from '@shared/enums/table-status.enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TableController {
   constructor(private readonly tableService: TableService) {}

   @Post()
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   create(@Body() createTableDto: CreateTableDto) {
      return this.tableService.create(createTableDto);
   }

   @Get()
   findAll() {
      return this.tableService.findAll();
   }

   @Get('available')
   findAvailable() {
      return this.tableService.findAvailable();
   }

   @Get(':id')
   findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.tableService.findOne(id);
   }

   @Put(':id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateTableDto: UpdateTableDto,
   ) {
      return this.tableService.update(id, updateTableDto);
   }

   @Put(':id/status/:status')
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.WAITER)
   updateStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Param('status') status: TableStatus,
   ) {
      return this.tableService.updateStatus(id, status);
   }

   @Delete(':id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.tableService.remove(id);
   }
}
