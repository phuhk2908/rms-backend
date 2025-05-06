import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

import { UserRole } from '@shared/enums/user-role.enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@Controller('user')
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Post()
   @Roles(UserRole.ADMIN, UserRole.MANAGER)
   create(@Body() createUserDto: CreateUserDto) {
      return this.userService.create(createUserDto);
   }

   // @Get()
   // @Roles(UserRole.ADMIN, UserRole.MANAGER)
   // findAll() {
   //    return this.userService.findAll();
   // }

   // @Get(':id')
   // @Roles(UserRole.ADMIN, UserRole.MANAGER)
   // findOne(@Param('id', ParseUUIDPipe) id: string) {
   //    return this.userService.findOne(id);
   // }

   // @Put(':id')
   // @Roles(UserRole.ADMIN, UserRole.MANAGER)
   // update(
   //    @Param('id', ParseUUIDPipe) id: string,
   //    @Body() updateUserDto: UpdateUserDto,
   // ) {
   //    return this.userService.update(id, updateUserDto);
   // }

   // @Delete(':id')
   // @Roles(UserRole.ADMIN)
   // remove(@Param('id', ParseUUIDPipe) id: string) {
   //    return this.userService.remove(id);
   // }
}
