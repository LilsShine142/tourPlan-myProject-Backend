import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!, // Nhớ có biến này trong file .env
    });
  }

  async validate(payload: JwtPayload) {
    const userId = payload.sub;

    // 1. Kiểm tra xem User có đang "Active Session" trong Redis không
    const user = await this.cacheManager.get<any>(`user:${userId}`);

    // 2. NẾU KHÔNG CÓ TRONG REDIS -> Nghĩa là đã LOGOUT hoặc HẾT PHIÊN ĐĂNG NHẬP
    if (!user) {
      // Không cho phép chạy xuống DB nữa, chặn ngay tại đây!
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn hoặc bạn đã đăng xuất!');
    }

    // 3. Nếu có trong Redis thì trả về data luôn
    return user; 
  }
}
