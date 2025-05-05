import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
   constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
   ) {}

   async create(createUserDto: CreateUserDto): Promise<User> {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = this.userRepository.create({
         ...createUserDto,
         password: hashedPassword,
      });
      return this.userRepository.save(user);
   }

   async findAll(): Promise<User[]> {
      return this.userRepository.find();
   }

   async findOne(id: string): Promise<User> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
         throw new NotFoundException('User not found');
      }
      return user;
   }

   async findByEmail(email: string): Promise<User | null> {
      return this.userRepository.findOne({ where: { email } });
   }

   async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      const user = await this.findOne(id);
      if (updateUserDto.password) {
         updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      return this.userRepository.save({ ...user, ...updateUserDto });
   }

   async remove(id: string): Promise<void> {
      const user = await this.findOne(id);
      await this.userRepository.remove(user);
   }
}
