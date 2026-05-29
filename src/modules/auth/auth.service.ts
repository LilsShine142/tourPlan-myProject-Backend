import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // 👈 Inject Redis Cache
  ) { }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new BadRequestException('Email đã được sử dụng!');
    const defaultRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });

    // Thêm dòng chặn lỗi này
    if (!defaultRole) {
      throw new InternalServerErrorException('Lỗi hệ thống: Chưa khởi tạo vai trò mặc định trong Database!');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        displayName: dto.displayName,
        provider: 'email',
        roleId: defaultRole.id, // Gán role mặc định
      }
    });

    return { message: 'Đăng ký thành công', data: { userId: newUser.id } };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) throw new UnauthorizedException('Sai email hoặc mật khẩu!');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Sai email hoặc mật khẩu!');

    const payload: JwtPayload = { sub: user.id, email: user.email, roleId: user.roleId };
    const accessToken = await this.jwtService.signAsync(payload);
    // Lấy full thông tin giống cấu trúc của "getMe" để lưu vào Redis
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (fullUser) {
      const { password, ...userWithoutPassword } = fullUser;
      
      // Lưu vào Redis với key dạng 'user:uuid-cua-user'
      // TTL: 86400 giây (1 ngày) - Lưu ý: Nếu dùng cache-manager v5, TTL tính bằng miligiây (86400000)
      await this.cacheManager.set(`user:${user.id}`, userWithoutPassword, 86400);
    }
    return {
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        user: { id: user.id, email: user.email, roleId: user.roleId, displayName: user.displayName },
      }
    };
  }

  async logout(userId: string) {
    // 1. Định dạng đúng Key của user cần xóa cache (khớp với lúc login)
    const cacheKey = `user:${userId}`;

    // 2. Chọc vào Redis và xóa Key này đi
    await this.cacheManager.del(cacheKey);

    // 3. Trả về thông báo thành công cho Frontend
    return {
      statusCode: 200,
      message: 'Đăng xuất thành công và đã xóa dữ liệu cache!',
    };
  }
}