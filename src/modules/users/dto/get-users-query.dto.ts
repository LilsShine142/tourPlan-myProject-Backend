import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

export class GetUsersQueryDto {
  @ApiPropertyOptional({ description: 'Số lượng bản ghi trên mỗi trang', default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Số lượng bản ghi bỏ qua (Vị trí bắt đầu lấy)', default: 0, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo email hoặc tên hiển thị', example: 'Nguyễn' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo role', enum: Role })
  @IsOptional()
  role?: Role;
}
