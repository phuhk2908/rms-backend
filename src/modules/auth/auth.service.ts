import { Injectable } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
   constructor(
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
   ) {}

   async validateUser(email: string, password: string): Promise<User | null> {
      const user = await this.userService.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
         return user;
      }
      return null;
   }

   async login(user: User) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
         access_token: this.jwtService.sign(payload),
         user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
         },
      };
   }
}
