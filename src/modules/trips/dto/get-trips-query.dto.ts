import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';

export class GetTripsQueryDto {
  @ApiPropertyOptional({ description: 'Số lượng bản ghi trên mỗi trang', default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number) // Ép kiểu từ chuỗi trên URL thành số Int
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Số trang hiện tại', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo Tiêu đề hoặc Mô tả', example: 'Đà Lạt' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái chuyến đi', enum: TripStatus, example: 'planning' })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}