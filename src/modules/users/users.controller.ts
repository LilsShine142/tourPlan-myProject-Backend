import { Controller, Get, Patch, Body, UseGuards, UseInterceptors, UploadedFile, Delete, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UploadService } from '../../common/upload/upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Users') // Tên nhóm hiển thị trên Swagger (để "Users" cho ngắn gọn giống Auth)
@ApiBearerAuth()  // Hiển thị biểu tượng cái khóa yêu cầu Token
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  // --- CÁC API DÀNH CHO USER THƯỜNG (Không gắn @Roles nên ai login cũng dùng được) ---// --- CÁC API DÀNH CHO USER THƯỜNG (Không gắn @Roles nên ai login cũng dùng được) ---

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin profile của người đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công.' })
  getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân cơ bản' })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin thành công.' })
  updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file')) // Đã xóa bớt 1 dòng trùng lặp ở đây
  @ApiOperation({ summary: 'Cập nhật ảnh đại diện (Avatar)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Cập nhật ảnh đại diện thành công.' })
  @ApiBody({
    description: 'Chọn file ảnh từ máy tính',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async updateAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.uploadService.uploadImage(file);
    return this.usersService.updateImage(user.id, imageUrl, 'avatarUrl');
  }

  @Patch('cover-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Cập nhật ảnh bìa (Cover Image)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Cập nhật ảnh bìa thành công.' })
  @ApiBody({
    description: 'Chọn file ảnh từ máy tính',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async updateCoverImage(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.uploadService.uploadImage(file);
    return this.usersService.updateImage(user.id, imageUrl, 'coverUrl');
  }

  // --- CÁC API BẢO MẬT CHỈ DÀNH CHO ADMIN ---
  // API cho quản trị
  @Get()
  @Roles(Role.ADMIN) // Chỉ Admin mới được phép truy cập API này  
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (Dành cho Admin)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Chỉ Admin mới được phép truy cập API này
  @ApiOperation({ summary: 'Xóa một người dùng theo ID (Dành cho Admin)' })
  @ApiParam({ name: 'id', description: 'ID của người dùng cần xóa', type: 'string' }) // Đổi 'number' thành 'string' nếu ID của bạn là UUID
  @ApiResponse({ status: 200, description: 'Xóa người dùng thành công.' })
  deleteUser(@Param('id') id: string) {
    // Ép kiểu id sang number nếu Database dùng Interger ID. Nếu dùng UUID thì bỏ dấu +
    return this.usersService.deleteUser(id); 
  }
}