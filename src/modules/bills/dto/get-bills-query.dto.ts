import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillCategory } from '@prisma/client';

export class GetBillsQueryDto {
  @ApiPropertyOptional({ default: 1, description: 'Số trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Số lượng bản ghi trên một trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tiêu đề hóa đơn (ví dụ: lẩu bò, taxi...)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BillCategory, description: 'Lọc hóa đơn theo danh mục chi tiêu' })
  @IsOptional()
  @IsEnum(BillCategory)
  category?: BillCategory;
}