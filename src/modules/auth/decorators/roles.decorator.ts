import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@shared/enums/user-role.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
