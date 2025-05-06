import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/entities/base.entity';
import { User } from '@modules/user/entities/user.entity';

@Entity()
export class RefreshToken extends BaseEntity {
   @Column()
   token: string;

   @Column()
   expiresAt: Date;

   @Column({ default: false })
   isRevoked: boolean;

   @ManyToOne(() => User, (user) => user.refreshTokens)
   user: User;

   @Column()
   userAgent: string;

   @Column()
   ipAddress: string;
}
