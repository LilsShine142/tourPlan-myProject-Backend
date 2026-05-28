import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!, // Nhớ có biến này trong file .env
    });
  }

  async validate(payload: JwtPayload) {
    // Trả về dữ liệu này, nó sẽ được nhét vào request.user (để @CurrentUser lấy)
    // Có displayName để khớp với type Prisma User (nếu bạn đang dùng request.user làm User)
    return {
      id: payload.sub,
      email: payload.email,
      displayName: '',
    };
  }
}
