// BẮT BUỘC dùng PartialType của swagger để kế thừa được document trên giao diện
import { PartialType, ApiProperty } from '@nestjs/swagger'; 
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsDateString, MaxLength, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ example: 'nguyenvana@gmail.com', description: 'Địa chỉ email' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email!: string;
  
    @ApiProperty({ example: '123456', description: 'Mật khẩu (Ít nhất 6 ký tự)' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password!: string;
  
    @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên hiển thị' })
    @IsString()
    @IsNotEmpty({ message: 'Tên hiển thị không được để trống' })
    displayName!: string;
    @ApiProperty({ example: 'Đam mê du lịch và khám phá', description: 'Tiểu sử ngắn', required: false })
    @IsString({ message: 'Tiểu sử phải là chuỗi ký tự' })
    @MaxLength(500, { message: 'Tiểu sử không được vượt quá 500 ký tự' })
    @IsOptional()
    bio?: string;

    @ApiProperty({ example: '1999-12-31', description: 'Ngày sinh (YYYY-MM-DD)', required: false })
    @IsDateString({}, { message: 'Ngày sinh phải đúng định dạng YYYY-MM-DD' })
    @IsOptional()
    birthday?: string;
}