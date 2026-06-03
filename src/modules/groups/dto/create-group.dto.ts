import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { GroupType, GroupCurrency } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'Hội Phượt Đà Lạt 2026' })
  @IsString() @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: GroupType, example: 'trip' })
  @IsEnum(GroupType)
  type!: GroupType;

  @ApiProperty({ enum: GroupCurrency, example: 'VND' })
  @IsEnum(GroupCurrency)
  currency!: GroupCurrency;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/group-cover.jpg' })
  @IsString() @IsOptional()
  coverUrl?: string;
}