import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LocationCategory, TravelMode } from '@prisma/client';

export class CreateDestinationDto {
  @ApiProperty({ example: 'uuid-cua-trip' })
  @IsString() @IsNotEmpty()
  tripId!: string;

  @ApiProperty({ example: 'Ngày 1: Khám phá Bắc Đảo' })
  @IsString() @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Tham quan VinWonders và Safari', required: false })
  @IsString() @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: 'Thứ tự của chặng' })
  @IsInt() @IsNotEmpty()
  sequence!: number;
}

export class CreatePlaceItemDto {
  @ApiProperty({ example: 'Nhà hàng Xin Chào' })
  @IsString() @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 10.2222 })
  @IsNumber() @IsNotEmpty()
  latitude!: number;

  @ApiProperty({ example: 103.9999 })
  @IsNumber() @IsNotEmpty()
  longitude!: number;

  @ApiProperty({ enum: LocationCategory, example: LocationCategory.restaurant })
  @IsEnum(LocationCategory) @IsNotEmpty()
  category!: LocationCategory;

  @ApiProperty({ example: 1, description: 'Thứ tự trong chặng' })
  @IsInt() @IsNotEmpty()
  sequence!: number;

  @ApiProperty({ example: 500000, required: false })
  @IsNumber() @IsOptional()
  cost?: number;

  @ApiProperty({ example: '123 Đường A, Phú Quốc', required: false })
  @IsString() @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Nên đặt bàn trước', required: false })
  @IsString() @IsOptional()
  note?: string;

  @ApiProperty({ example: '2026-06-15T10:00:00.000Z', required: false })
  @IsOptional()
  visitTime?: string;

  @ApiProperty({ example: 90, required: false, description: 'Số phút dự kiến ở lại' })
  @IsInt() @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ enum: TravelMode, required: false, example: TravelMode.driving })
  @IsEnum(TravelMode) @IsOptional()
  travelModeToNext?: TravelMode;

  @ApiProperty({ example: 12.5, required: false, description: 'Quãng đường đến điểm tiếp theo (km)' })
  @IsNumber() @IsOptional()
  distanceToNext?: number;

  @ApiProperty({ example: 25, required: false, description: 'Thời gian di chuyển đến điểm tiếp theo (phút)' })
  @IsInt() @IsOptional()
  durationToNext?: number;

}