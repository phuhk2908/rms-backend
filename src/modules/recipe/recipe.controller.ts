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
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeService } from './recipe.service';

@ApiTags('Recipe Management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('recipes')
export class RecipeController {
  private readonly logger = new Logger(RecipeController.name);

  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.KITCHEN_STAFF) // Kitchen staff might create/propose recipes
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiResponse({ status: 201, description: 'Recipe created successfully.' })
  createRecipe(@Body() createRecipeDto: CreateRecipeDto, @Req() req) {
    this.logger.log(
      `User ${req.user.email} creating recipe: ${createRecipeDto.name}`,
    );
    return this.recipeService.createRecipe(createRecipeDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.KITCHEN_STAFF, Role.WAITER) // Waiters might need to see recipe details for allergies
  @ApiOperation({ summary: 'Get all recipes' })
  @ApiResponse({ status: 200, description: 'List of all recipes.' })
  findAllRecipes(@Req() req) {
    this.logger.log(`User ${req.user.email} fetching all recipes.`);
    return this.recipeService.findAllRecipes();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.KITCHEN_STAFF, Role.WAITER)
  @ApiOperation({ summary: 'Get a specific recipe by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Recipe details.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
  async findOneRecipe(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} fetching recipe ID: ${id}`);
    const recipe = await this.recipeService.findOneRecipe(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID '${id}' not found.`);
    }
    return recipe;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.KITCHEN_STAFF)
  @ApiOperation({ summary: 'Update a recipe' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Recipe updated successfully.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
  updateRecipe(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Req() req,
  ) {
    this.logger.log(`User ${req.user.email} updating recipe ID: ${id}`);
    return this.recipeService.updateRecipe(id, updateRecipeDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Recipe deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
  removeRecipe(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} deleting recipe ID: ${id}`);
    return this.recipeService.removeRecipe(id);
  }
}
