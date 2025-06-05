import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Ingredient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  async createIngredient(dto: CreateIngredientDto): Promise<Ingredient> {
    this.logger.log(`Creating ingredient: ${dto.name}`);
    try {
      return await this.prisma.ingredient.create({ data: dto });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new ConflictException(
          `Ingredient with name '${dto.name}' already exists.`,
        );
      }
      this.logger.error(
        `Failed to create ingredient ${dto.name}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not create ingredient.');
    }
  }

  async findAllIngredients(): Promise<Ingredient[]> {
    this.logger.log('Fetching all ingredients');
    return this.prisma.ingredient.findMany();
  }

  async findOneIngredient(id: string): Promise<Ingredient | null> {
    this.logger.log(`Fetching ingredient with ID: ${id}`);
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });
    if (!ingredient) {
      this.logger.warn(`Ingredient with ID ${id} not found.`);
    }
    return ingredient;
  }

  async updateIngredient(
    id: string,
    dto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    this.logger.log(`Updating ingredient with ID: ${id}`);
    try {
      return await this.prisma.ingredient.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Ingredient with ID '${id}' not found.`);
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new ConflictException(
          `Ingredient with name '${dto.name}' already exists.`,
        );
      }
      this.logger.error(
        `Failed to update ingredient ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not update ingredient.');
    }
  }

  async removeIngredient(id: string): Promise<Ingredient> {
    this.logger.log(`Removing ingredient with ID: ${id}`);
    try {
      // Check if ingredient is used in recipes - Prisma schema uses onDelete: Restrict
      return await this.prisma.ingredient.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Ingredient with ID '${id}' not found.`);
      }
      if (error.code === 'P2003') {
        // Foreign key constraint failed (e.g., used in RecipeIngredient)
        throw new ConflictException(
          `Cannot delete ingredient with ID '${id}' as it is used in recipes.`,
        );
      }
      this.logger.error(
        `Failed to remove ingredient ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not remove ingredient.');
    }
  }

  async adjustStock(id: string, dto: AdjustStockDto): Promise<Ingredient> {
    this.logger.log(
      `Adjusting stock for ingredient ID: ${id} by ${dto.adjustment}`,
    );
    const ingredient = await this.findOneIngredient(id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID '${id}' not found.`);
    }

    const newStockQuantity = ingredient.stockQuantity + dto.adjustment;
    if (newStockQuantity < 0) {
      throw new ConflictException(
        `Stock quantity cannot be negative. Current stock: ${ingredient.stockQuantity}, Adjustment: ${dto.adjustment}`,
      );
    }

    // Here you might also add a stock movement log entry in a more advanced system
    // For now, just update the ingredient's stock.
    const updatedIngredient = await this.prisma.ingredient.update({
      where: { id },
      data: { stockQuantity: newStockQuantity },
    });

    // Check for low stock alert
    if (
      updatedIngredient.lowStockThreshold !== null &&
      updatedIngredient.stockQuantity <= updatedIngredient.lowStockThreshold
    ) {
      this.logger.warn(
        `LOW STOCK ALERT: Ingredient ${updatedIngredient.name} (ID: ${id}) is at ${updatedIngredient.stockQuantity} ${updatedIngredient.unit}. Threshold: ${updatedIngredient.lowStockThreshold}`,
      );
      // In a real system, trigger a notification here (e.g., to NotificationService)
    }

    return updatedIngredient;
  }

  async getLowStockIngredients(): Promise<Ingredient[]> {
    this.logger.log('Fetching ingredients with low stock.');
    return this.prisma.ingredient.findMany({
      where: {
        lowStockThreshold: { not: null }, // Only consider ingredients with a threshold set
        stockQuantity: {
          //lte: this.prisma.ingredient.fields.lowStockThreshold // This direct field comparison is not supported directly in Prisma where clause like this
          // Instead, we have to use a raw query or fetch and filter, or structure differently.
          // For simplicity, we can fetch all and filter, or use a specific value if thresholds are somewhat uniform.
          // A more robust solution would involve a raw query or database view if performance becomes an issue.
          // Let's assume we fetch ingredients where stock is simply low (e.g. <= some fixed value or <= lowStockThreshold which means we need to compare it)
          // Prisma doesn't directly support comparing two columns in a where clause like `stockQuantity <= lowStockThreshold`.
          // We would typically fetch all ingredients and filter in application code, or use $queryRaw.
          // For this example, let's simplify and get items where stock is <= a fixed number or threshold if defined.
          // This is a simplification due to Prisma limitations for direct column comparison in `where`.
        },
      },
    });
    // Post-fetch filter (less efficient for large datasets, but avoids raw SQL for now)
    const allIngredients = await this.prisma.ingredient.findMany({
      where: { lowStockThreshold: { not: null } },
    });
    return allIngredients.filter(
      (ing) => ing.stockQuantity <= ing.lowStockThreshold!,
    );
  }
}
