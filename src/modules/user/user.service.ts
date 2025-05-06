import {
   Injectable,
   ConflictException,
   NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
   constructor(
      @InjectRepository(User)
      private usersRepository: Repository<User>,
   ) {}

   async findByEmail(email: string): Promise<User | undefined> {
      return this.usersRepository.findOne({ where: { email } });
   }

   async findById(id: string): Promise<User | undefined> {
      return this.usersRepository.findOne({ where: { id } });
   }

   async create(createUserDto: CreateUserDto): Promise<User> {
      const { email, password } = createUserDto;

      // Check if user already exists
      const userExists = await this.findByEmail(email);
      if (userExists) {
         throw new ConflictException('Email already in use');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = this.usersRepository.create({
         ...createUserDto,
         password: hashedPassword,
      });

      return this.usersRepository.save(user);
   }

   async updateRefreshToken(
      userId: string,
      refreshToken: string | null,
   ): Promise<void> {
      // If refreshToken is null, we're logging out
      const hash = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;

      await this.usersRepository.update({ id: userId }, { refreshToken: hash });
   }

   async getUserIfRefreshTokenMatches(
      userId: string,
      refreshToken: string,
   ): Promise<User> {
      const user = await this.findById(userId);

      if (!user || !user.refreshToken) {
         throw new NotFoundException('User not found or not logged in');
      }

      const refreshTokenMatches = await bcrypt.compare(
         refreshToken,
         user.refreshToken,
      );

      if (!refreshTokenMatches) {
         throw new NotFoundException('Invalid refresh token');
      }

      return user;
   }
}
