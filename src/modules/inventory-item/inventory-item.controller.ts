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
   Query,
} from '@nestjs/common';
import { InventoryItemService } from './inventory-item.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateSupplierDto } from '../supplier/dto/create-supplier.dto';
import { UpdateSupplierDto } from '../supplier/dto/update-supplier.dto';

import { UserRole } from '../../shared/enums/user-role.enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryItemController {
   constructor(private readonly inventoryService: InventoryItemService) {}

   // Inventory Items
   @Post('items')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   createInventoryItem(@Body() createInventoryItemDto: CreateInventoryItemDto) {
      return this.inventoryService.createInventoryItem(createInventoryItemDto);
   }

   @Get('items')
   findAllInventoryItems() {
      return this.inventoryService.findAllInventoryItems();
   }

   @Get('items/low-stock')
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CHEF)
   findLowStockItems(@Query('threshold') threshold: number = 10) {
      return this.inventoryService.findLowStockItems(Number(threshold));
   }

   @Get('items/expiring-soon')
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CHEF)
   findExpiringSoon(@Query('days') days: number = 7) {
      return this.inventoryService.findExpiringSoon(Number(days));
   }

   @Get('items/:id')
   findOneInventoryItem(@Param('id', ParseUUIDPipe) id: string) {
      return this.inventoryService.findOneInventoryItem(id);
   }

   @Put('items/:id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   updateInventoryItem(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateInventoryItemDto: UpdateInventoryItemDto,
   ) {
      return this.inventoryService.updateInventoryItem(
         id,
         updateInventoryItemDto,
      );
   }

   @Put('items/:id/adjust/:adjustment')
   @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CHEF)
   adjustInventoryItemQuantity(
      @Param('id', ParseUUIDPipe) id: string,
      @Param('adjustment') adjustment: string,
   ) {
      return this.inventoryService.adjustInventoryItemQuantity(
         id,
         Number(adjustment),
      );
   }

   @Delete('items/:id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   removeInventoryItem(@Param('id', ParseUUIDPipe) id: string) {
      return this.inventoryService.removeInventoryItem(id);
   }

   // Suppliers
   @Post('suppliers')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
      return this.inventoryService.createSupplier(createSupplierDto);
   }

   @Get('suppliers')
   findAllSuppliers() {
      return this.inventoryService.findAllSuppliers();
   }

   @Get('suppliers/:id')
   findOneSupplier(@Param('id', ParseUUIDPipe) id: string) {
      return this.inventoryService.findOneSupplier(id);
   }

   @Put('suppliers/:id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   updateSupplier(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateSupplierDto: UpdateSupplierDto,
   ) {
      return this.inventoryService.updateSupplier(id, updateSupplierDto);
   }

   @Delete('suppliers/:id')
   @Roles(UserRole.MANAGER, UserRole.ADMIN)
   removeSupplier(@Param('id', ParseUUIDPipe) id: string) {
      return this.inventoryService.removeSupplier(id);
   }
}
