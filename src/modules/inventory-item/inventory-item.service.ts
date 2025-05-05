import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { Ingredient } from '../ingredient/entities/ingredient.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateSupplierDto } from '../supplier/dto/create-supplier.dto';
import { UpdateSupplierDto } from '../supplier/dto/update-supplier.dto';

@Injectable()
export class InventoryItemService {
   constructor(
      @InjectRepository(InventoryItem)
      private readonly inventoryItemRepository: Repository<InventoryItem>,
      @InjectRepository(Supplier)
      private readonly supplierRepository: Repository<Supplier>,
      @InjectRepository(Ingredient)
      private readonly ingredientRepository: Repository<Ingredient>,
   ) {}

   // Inventory Item methods
   async createInventoryItem(
      createInventoryItemDto: CreateInventoryItemDto,
   ): Promise<InventoryItem> {
      const supplier = await this.supplierRepository.findOne({
         where: { id: createInventoryItemDto.supplierId },
      });
      if (!supplier) {
         throw new NotFoundException('Supplier not found');
      }

      const ingredient = await this.ingredientRepository.findOne({
         where: { id: createInventoryItemDto.ingredientId },
      });
      if (!ingredient) {
         throw new NotFoundException('Ingredient not found');
      }

      const inventoryItem = this.inventoryItemRepository.create({
         ...createInventoryItemDto,
         supplier,
         ingredient,
      });

      return this.inventoryItemRepository.save(inventoryItem);
   }

   async findAllInventoryItems(): Promise<InventoryItem[]> {
      return this.inventoryItemRepository.find({
         relations: ['supplier', 'ingredient'],
      });
   }

   async findLowStockItems(threshold = 10): Promise<InventoryItem[]> {
      return this.inventoryItemRepository
         .createQueryBuilder('item')
         .leftJoinAndSelect('item.ingredient', 'ingredient')
         .leftJoinAndSelect('item.supplier', 'supplier')
         .where('item.quantity <= :threshold', { threshold })
         .orWhere('item.quantity <= item.minimumQuantity')
         .getMany();
   }

   async findExpiringSoon(days = 7): Promise<InventoryItem[]> {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return this.inventoryItemRepository
         .createQueryBuilder('item')
         .leftJoinAndSelect('item.ingredient', 'ingredient')
         .leftJoinAndSelect('item.supplier', 'supplier')
         .where('item.expiryDate <= :date', { date })
         .andWhere('item.expiryDate >= CURRENT_DATE')
         .getMany();
   }

   async findOneInventoryItem(id: string): Promise<InventoryItem> {
      const inventoryItem = await this.inventoryItemRepository.findOne({
         where: { id },
         relations: ['supplier', 'ingredient'],
      });
      if (!inventoryItem) {
         throw new NotFoundException('Inventory item not found');
      }
      return inventoryItem;
   }

   async updateInventoryItem(
      id: string,
      updateInventoryItemDto: UpdateInventoryItemDto,
   ): Promise<InventoryItem> {
      const inventoryItem = await this.findOneInventoryItem(id);
      return this.inventoryItemRepository.save({
         ...inventoryItem,
         ...updateInventoryItemDto,
      });
   }

   async adjustInventoryItemQuantity(
      id: string,
      adjustment: number,
   ): Promise<InventoryItem> {
      const inventoryItem = await this.findOneInventoryItem(id);
      inventoryItem.quantity += adjustment;
      return this.inventoryItemRepository.save(inventoryItem);
   }

   async removeInventoryItem(id: string): Promise<void> {
      const inventoryItem = await this.findOneInventoryItem(id);
      await this.inventoryItemRepository.remove(inventoryItem);
   }

   // Supplier methods
   async createSupplier(
      createSupplierDto: CreateSupplierDto,
   ): Promise<Supplier> {
      const supplier = this.supplierRepository.create(createSupplierDto);
      return this.supplierRepository.save(supplier);
   }

   async findAllSuppliers(): Promise<Supplier[]> {
      return this.supplierRepository.find({ relations: ['items'] });
   }

   async findOneSupplier(id: string): Promise<Supplier> {
      const supplier = await this.supplierRepository.findOne({
         where: { id },
         relations: ['items'],
      });
      if (!supplier) {
         throw new NotFoundException('Supplier not found');
      }
      return supplier;
   }

   async updateSupplier(
      id: string,
      updateSupplierDto: UpdateSupplierDto,
   ): Promise<Supplier> {
      const supplier = await this.findOneSupplier(id);
      return this.supplierRepository.save({
         ...supplier,
         ...updateSupplierDto,
      });
   }

   async removeSupplier(id: string): Promise<void> {
      const supplier = await this.findOneSupplier(id);
      await this.supplierRepository.remove(supplier);
   }
}
