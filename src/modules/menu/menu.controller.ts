import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   Delete,
   ParseUUIDPipe,
   Put,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

@Controller('menu')
export class MenuController {
   constructor(private readonly menuService: MenuService) {}

   // Menu Items
   @Post('items')
   @Roles(UserRole.ADMIN, UserRole.MANAGER)
   createMenuItem(@Body() createMenuItemDto: CreateMenuDto) {
      return this.menuService.createMenuItem(createMenuItemDto);
   }

   @Get('items')
   findAllMenuItems() {
      return this.menuService.findAllMenuItems();
   }

   @Get('items/active')
   findActiveMenuItems() {
      return this.menuService.findActiveMenuItems();
   }

   @Get('items/:id')
   findOneMenuItem(@Param('id', ParseUUIDPipe) id: string) {
      return this.menuService.findOneMenuItem(id);
   }

   @Put('items/:id')
   @Roles(UserRole.ADMIN, UserRole.MANAGER)
   updateMenuItem(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateMenuItemDto: UpdateMenuDto,
   ) {
      return this.menuService.updateMenuItem(id, updateMenuItemDto);
   }

   @Delete('items/:id')
   @Roles(UserRole.ADMIN, UserRole.MANAGER)
   removeMenuItem(@Param('id', ParseUUIDPipe) id: string) {
      return this.menuService.removeMenuItem(id);
   }

   // Menu Categories
   @Post('categories')
   @Roles(UserRole.ADMIN, UserRole.MANAGER)
   createMenuCategory(@Body() createMenuCategoryDto: CreateMenuCategoryDto) {
      return this.menuService.createMenuCategory(createMenuCategoryDto);
   }

   @Get('categories')
   findAllMenuCategories() {
      return this.menuService.findAllMenuCategories();
   }

   @Get('categories/:id')
   findOneMenuCategory(@Param('id', ParseUUIDPipe) id: string) {
      return this.menuService.findOneMenuCategory(id);
   }

   @Put('categories/:id')
   @Roles(UserRole.ADMIN, UserRole.MANAGER)
   updateMenuCategory(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateMenuCategoryDto: UpdateMenuCategoryDto,
   ) {
      return this.menuService.updateMenuCategory(id, updateMenuCategoryDto);
   }

   @Delete('categories/:id')
   @Roles(UserRole.ADMIN, UserRole.MANAGER)
   removeMenuCategory(@Param('id', ParseUUIDPipe) id: string) {
      return this.menuService.removeMenuCategory(id);
   }
}
