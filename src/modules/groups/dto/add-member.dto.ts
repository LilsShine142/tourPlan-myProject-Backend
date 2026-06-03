import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { MemberRole } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiPropertyOptional({ example: 'user-uuid-123', description: 'Có thể để trống đối với thành viên ảo' })
  @IsString() @IsOptional()
  userId?: string;

  @ApiProperty({ example: 'Tuấn Sứt' })
  @IsString() @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/avatar.jpg' })
  @IsString() @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: MemberRole, default: 'member' })
  @IsEnum(MemberRole) @IsOptional()
  role?: MemberRole = 'member';
}