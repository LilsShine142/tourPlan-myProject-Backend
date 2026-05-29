import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @ApiBearerAuth()            // Hiện ổ khóa bảo mật trên Swagger
  @UseGuards(JwtAuthGuard)    // Bật khiên Guard để bóc tách Token lấy thông tin user
  @ApiOperation({ summary: 'Đăng xuất khỏi hệ thống và xóa sạch cache Redis' })
  async logout(@CurrentUser() user: any) {
    // user.id lấy từ request.user do JwtStrategy nạp vào ban nãy
    return await this.authService.logout(user.id);
  }

  // --- TEST GUARD VÀ DECORATOR MỚI TẠO ---
  @Get('me')
  @ApiBearerAuth() // Hiện nút ổ khoá trên Swagger
  @UseGuards(JwtAuthGuard) // Bật khiên bảo vệ
  @ApiOperation({ summary: 'Lấy thông tin người đang đăng nhập' })
  getProfile(@CurrentUser() user: any) {
    // Nếu token đúng, nó sẽ lọt vào đây và in ra dữ liệu của User
    return {
      message: 'Lấy thông tin thành công',
      data: user,
    };
  }
}