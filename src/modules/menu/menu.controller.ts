import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query, Logger, NotFoundException, Req } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator'; // Import the Public decorator
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';


@ApiTags('Menu & Categories')
@Controller('menu')
// Apply guards at controller level, specific routes can override or be made public
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth') // Suggests auth for Swagger UI, but @Public will bypass
export class MenuController {
  private readonly logger = new Logger(MenuController.name);

  constructor(private readonly menuService: MenuService) { }

  // --- Category Endpoints ---
  @Post('categories')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new menu category (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @Req() req) {
    this.logger.log(`User ${req.user.email} creating category: ${createCategoryDto.name}`);
    return this.menuService.createCategory(createCategoryDto);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all menu categories (Public)' })
  @ApiResponse({ status: 200, description: 'List of all categories.' })
  findAllCategories(@Req() req) { // req.user will be undefined if no token is provided
    this.logger.log(`Public user or User ${req.user?.email || 'anonymous'} fetching all categories.`);
    return this.menuService.findAllCategories();
  }

  @Public() // This route is now public
  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a specific category by ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Category details.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOneCategory(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`Public user or User ${req.user?.email || 'anonymous'} fetching category ID: ${id}`);
    const category = await this.menuService.findOneCategory(id);
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found.`);
    }
    return category;
  }

  @Patch('categories/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a category (Admin/Manager only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req
  ) {
    this.logger.log(`User ${req.user.email} updating category ID: ${id}`);
    return this.menuService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  removeCategory(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} deleting category ID: ${id}`);
    return this.menuService.removeCategory(id);
  }

  // --- MenuItem Endpoints ---
  @Post('items')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new menu item (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully.' })
  createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto, @Req() req) {
    this.logger.log(`User ${req.user.email} creating menu item: ${createMenuItemDto.name}`);
    return this.menuService.createMenuItem(createMenuItemDto);
  }

  @Public() // This route is now public
  @Get('items')
  @ApiOperation({ summary: 'Get all menu items (Public)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID (UUID)' })
  @ApiQuery({ name: 'available', required: false, type: Boolean, description: 'Filter by availability (true/false)' })
  @ApiResponse({ status: 200, description: 'List of all menu items.' })
  findAllMenuItems(
    @Req() req, // req.user will be undefined for anonymous access
    @Query('categoryId') categoryId?: string,
    @Query('available') available?: string,
  ) {
    this.logger.log(`Public user or User ${req.user?.email || 'anonymous'} fetching all menu items. Category: ${categoryId}, Available: ${available}`);
    let availabilityFilter: boolean | undefined;
    if (available === 'true') availabilityFilter = true;
    if (available === 'false') availabilityFilter = false;
    return this.menuService.findAllMenuItems(categoryId, availabilityFilter);
  }

  @Public() // This route is now public
  @Get('items/:id')
  @ApiOperation({ summary: 'Get a specific menu item by ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Menu item details.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  async findOneMenuItem(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`Public user or User ${req.user?.email || 'anonymous'} fetching menu item ID: ${id}`);
    const menuItem = await this.menuService.findOneMenuItem(id);
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID '${id}' not found.`);
    }
    return menuItem;
  }

  @Patch('items/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a menu item (Admin/Manager only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  updateMenuItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @Req() req
  ) {
    this.logger.log(`User ${req.user.email} updating menu item ID: ${id}`);
    return this.menuService.updateMenuItem(id, updateMenuItemDto);
  }

  @Delete('items/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a menu item (Admin/Manager only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  removeMenuItem(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    this.logger.log(`User ${req.user.email} deleting menu item ID: ${id}`);
    return this.menuService.removeMenuItem(id);
  }
}