import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Category, MenuItem } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(private prisma: PrismaService) {}

  // --- Category Methods ---
  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`Creating category: ${dto.name}`);
    try {
      return await this.prisma.category.create({ data: dto });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new ConflictException(
          `Category with name '${dto.name}' already exists.`,
        );
      }
      this.logger.error(
        `Failed to create category ${dto.name}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not create category.');
    }
  }

  async findAllCategories(): Promise<Category[]> {
    this.logger.log('Fetching all categories');
    return this.prisma.category.findMany({ include: { menuItems: false } }); // menuItems can be fetched on demand
  }

  async findOneCategory(id: string): Promise<Category | null> {
    this.logger.log(`Fetching category with ID: ${id}`);
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { menuItems: true }, // Optionally include menu items
    });
    if (!category) {
      this.logger.warn(`Category with ID ${id} not found.`);
    }
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    this.logger.log(`Updating category with ID: ${id}`);
    try {
      return await this.prisma.category.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Category with ID '${id}' not found.`);
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new ConflictException(
          `Category with name '${dto.name}' already exists.`,
        );
      }
      this.logger.error(
        `Failed to update category ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not update category.');
    }
  }

  async removeCategory(id: string): Promise<Category> {
    this.logger.log(`Removing category with ID: ${id}`);
    // Consider implications: what happens to menu items in this category?
    // Prisma schema sets categoryId to null on menu items if category is deleted.
    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Category with ID '${id}' not found.`);
      }
      this.logger.error(
        `Failed to remove category ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not remove category.');
    }
  }

  // --- MenuItem Methods ---
  async createMenuItem(dto: CreateMenuItemDto): Promise<MenuItem> {
    this.logger.log(`Creating menu item: ${dto.name}`);
    const { categoryId, ...menuItemData } = dto;
    try {
      return await this.prisma.menuItem.create({
        data: {
          ...menuItemData,
          ...(categoryId && { category: { connect: { id: categoryId } } }),
        },
      });
    } catch (error) {
      // P2002 can happen if menu item name is unique constraint (not in current schema but good to be aware)
      // P2025 for categoryId not found
      if (
        error.code === 'P2025' &&
        error.meta?.cause?.includes('foreign key constraint failed')
      ) {
        throw new NotFoundException(
          `Category with ID '${categoryId}' not found. Cannot create menu item.`,
        );
      }
      this.logger.error(
        `Failed to create menu item ${dto.name}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not create menu item.');
    }
  }

  async findAllMenuItems(
    categoryId?: string,
    availability?: boolean,
  ): Promise<MenuItem[]> {
    this.logger.log(
      `Fetching all menu items. Category Filter: ${categoryId}, Availability Filter: ${availability}`,
    );
    const whereClause: any = {};
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (availability !== undefined) {
      // Check for undefined to allow filtering by false
      whereClause.isAvailable = availability;
    }
    return this.prisma.menuItem.findMany({
      where: whereClause,
      include: { category: true, recipes: false }, // recipes can be fetched on demand
    });
  }

  async findOneMenuItem(id: string): Promise<MenuItem | null> {
    this.logger.log(`Fetching menu item with ID: ${id}`);
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true, recipes: true }, // Optionally include related data
    });
    if (!menuItem) {
      this.logger.warn(`Menu item with ID ${id} not found.`);
    }
    return menuItem;
  }

  async updateMenuItem(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    this.logger.log(`Updating menu item with ID: ${id}`);
    const { categoryId, ...menuItemData } = dto;
    try {
      return await this.prisma.menuItem.update({
        where: { id },
        data: {
          ...menuItemData,
          ...(categoryId && { category: { connect: { id: categoryId } } }),
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Covers both menu item not found and category not found on connect
        const itemExists = await this.prisma.menuItem.findUnique({
          where: { id },
        });
        if (!itemExists) {
          throw new NotFoundException(`Menu item with ID '${id}' not found.`);
        }
        if (categoryId) {
          const categoryExists = await this.prisma.category.findUnique({
            where: { id: categoryId },
          });
          if (!categoryExists) {
            throw new NotFoundException(
              `Category with ID '${categoryId}' not found for menu item update.`,
            );
          }
        }
        // If P2025 is for another reason, rethrow generic error.
      }
      this.logger.error(
        `Failed to update menu item ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not update menu item.');
    }
  }

  async removeMenuItem(id: string): Promise<MenuItem> {
    this.logger.log(`Removing menu item with ID: ${id}`);
    try {
      return await this.prisma.menuItem.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Menu item with ID '${id}' not found.`);
      }
      // P2003: Foreign key constraint failed on the field: `menuItemId` (e.g. if an order item references it)
      // The schema uses onDelete: Restrict for OrderItem.menuItemId
      if (error.code === 'P2003') {
        throw new ConflictException(
          `Cannot delete menu item with ID '${id}' as it is referenced by other records (e.g., orders, recipes).`,
        );
      }
      this.logger.error(
        `Failed to remove menu item ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not remove menu item.');
    }
  }
}
