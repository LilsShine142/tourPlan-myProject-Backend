import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { GroupCurrency, TripStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({ example: 'Chuyến đi Đà Lạt hè 2026' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Đi trốn nóng cùng hội bạn thân', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-06-15T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2026-06-18T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ example: 'VND', enum: GroupCurrency })
  @IsEnum(GroupCurrency)
  currency!: GroupCurrency;

  @ApiProperty({ example: 'planning', enum: TripStatus, required: false })
  @IsEnum(TripStatus)
  @IsOptional()
  status?: TripStatus;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ example: 'uuid-of-group', required: false })
  @IsString()
  @IsOptional()
  groupId?: string;
}