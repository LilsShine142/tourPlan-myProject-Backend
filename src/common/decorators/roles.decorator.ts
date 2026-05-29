import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
// Cho phép truyền nhiều role cùng lúc, ví dụ: @Roles(Role.ADMIN, Role.MANAGER)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);