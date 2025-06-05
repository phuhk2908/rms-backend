import {
  UseGuards,
  Controller,
  Logger,
  Post,
  Body,
  Req,
  Get,
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
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory Management (Ingredients)')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('inventory/ingredients')
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new ingredient (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Ingredient created successfully.' })
  createIngredient(
    @Body() createIngredientDto: CreateIngredientDto,
    @Req() req,
  ) {
    this.logger.log(
      `User ${req.user.email} creating ingredient: ${createIngredientDto.name}`,
    );
    return this.inventoryService.createIngredient(createIngredientDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.KITCHEN_STAFF) // Kitchen staff might need to view ingredients
  @ApiOperation({ summary: 'Get all ingredients' })
  @ApiResponse({ status: 200, description: 'List of all ingredients.' })
  findAllIngredients(@Req() req) {
    this.logger.log(`User ${req.user.email} fetching all ingredients.`);
    return this.inventoryService.findAllIngredients();
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.MANAGER, Role.KITCHEN_STAFF)
  @ApiOperation({ summary: 'Get ingredients that are low on stock' })
  @ApiResponse({ status: 200, description: 'List of low stock ingredients.' })
  getLowStockIngredients(@Req() req) {
    this.logger.log(`User ${req.user.email} fetching low stock ingredients.`);
    return this.inventoryService.getLowStockIngredients();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.KITCHEN_STAFF)
  @ApiOperation({ summary: 'Get a specific ingredient by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ingredient details.' })
  @ApiResponse({ status: 404, description: 'Ingredient not found.' })
  async findOneIngredient(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} fetching ingredient ID: ${id}`);
    const ingredient = await this.inventoryService.findOneIngredient(id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID '${id}' not found.`);
    }
    return ingredient;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update an ingredient (Admin/Manager only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ingredient updated successfully.' })
  @ApiResponse({ status: 404, description: 'Ingredient not found.' })
  updateIngredient(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @Req() req,
  ) {
    this.logger.log(`User ${req.user.email} updating ingredient ID: ${id}`);
    return this.inventoryService.updateIngredient(id, updateIngredientDto);
  }

  @Post(':id/adjust-stock')
  @Roles(Role.ADMIN, Role.MANAGER, Role.KITCHEN_STAFF) // Kitchen staff may adjust stock after use/delivery
  @ApiOperation({ summary: 'Adjust stock quantity for an ingredient' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully.' })
  @ApiResponse({ status: 404, description: 'Ingredient not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - e.g. stock would go negative.',
  })
  adjustStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() adjustStockDto: AdjustStockDto,
    @Req() req,
  ) {
    this.logger.log(
      `User ${req.user.email} adjusting stock for ingredient ID: ${id} by ${adjustStockDto.adjustment}`,
    );
    return this.inventoryService.adjustStock(id, adjustStockDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete an ingredient (Admin/Manager only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Ingredient not found.' })
  @ApiResponse({ status: 409, description: 'Conflict - Ingredient is in use.' })
  removeIngredient(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} deleting ingredient ID: ${id}`);
    return this.inventoryService.removeIngredient(id);
  }
}
