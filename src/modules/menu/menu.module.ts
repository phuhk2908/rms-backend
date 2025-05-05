import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from '@modules/menu/entities/menu.entity';
import { MenuCategory } from '@modules/menu/entities/menu-category.entity';

@Module({
   imports: [TypeOrmModule.forFeature([MenuItem, MenuCategory])],
   controllers: [MenuController],
   providers: [MenuService],
   exports: [MenuService],
})
export class MenuModule {}
