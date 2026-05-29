import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Đọc danh sách các role được phép truy cập vào API này
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu API không gắn decorator @Roles, tức là public công khai cho mọi user đã login -> Cho qua
    if (!requiredRoles) {
      return true;
    }

    // 2. Lấy thông tin user từ request (đã được JwtAuthGuard điền vào trước đó)
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new ForbiddenException('Bạn không có quyền truy cập tính năng này');
    }

    // 3. SO SÁNH QUAN TRỌNG: Lấy user.role.name để so sánh thay vì user.role
    // Dùng optional chaining (?.) để tránh lỗi sập app nếu user không có role
    const hasRole = requiredRoles.includes(user?.role?.name);

    if (!hasRole) {
      throw new ForbiddenException('Chỉ tài khoản Admin mới có quyền thực hiện hành động này');
    }

    return true;
  }
}