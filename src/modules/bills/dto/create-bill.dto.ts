import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupCurrency, BillCategory, SplitMethod } from '@prisma/client';

class BillSplitDto {
  @ApiProperty({ example: 'member-uuid-1', description: 'ID của GroupMember gánh khoản này' })
  @IsString() @IsNotEmpty()
  groupMemberId!: string;

  @ApiProperty({ example: 50, description: 'Tỷ trọng chia (VD: % hoặc số lượng phần ăn)' })
  @IsNumber() @IsNotEmpty()
  shareValue!: number;

  @ApiProperty({ example: 200000, description: 'Số tiền thực tế quy đổi mà người này nợ' })
  @IsNumber() @IsNotEmpty()
  calculatedOwe!: number;
}

export class CreateBillDto {
  @ApiProperty({ example: 'group-uuid' })
  @IsString() @IsNotEmpty()
  groupId!: string;

  @ApiProperty({ example: 'Tiền ăn lẩu cua đồng' })
  @IsString() @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 600000 })
  @IsNumber() @IsNotEmpty()
  amount!: number;

  @ApiProperty({ enum: GroupCurrency, example: 'VND' })
  @IsEnum(GroupCurrency)
  currency!: GroupCurrency;

  @ApiProperty({ enum: BillCategory, example: 'food' })
  @IsEnum(BillCategory)
  category!: BillCategory;

  @ApiPropertyOptional({ example: '2026-06-03T15:30:00.000Z' })
  @IsDateString() @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: ['https://cloudinary.com/invoice1.jpg'] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  imageUrls?: string[];

  @ApiProperty({ example: 'member-uuid-payer', description: 'ID của GroupMember đứng ra trả tiền hóa đơn' })
  @IsString() @IsNotEmpty()
  paidBy!: string;

  @ApiProperty({ enum: SplitMethod, example: 'equal' })
  @IsEnum(SplitMethod)
  splitMethod!: SplitMethod;

  @ApiProperty({ type: [BillSplitDto] })
  @IsArray() @ValidateNested({ each: true })
  @Type(() => BillSplitDto)
  splits!: BillSplitDto[];
}