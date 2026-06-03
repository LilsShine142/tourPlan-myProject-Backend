import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ExploreService } from './explore.service';
import { GetToursQueryDto } from './dto/get-tours-query.dto';

@ApiTags('Explore & Marketplace (Chợ Lịch Trình)')
@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Get('tours')
  @ApiOperation({ summary: 'Lấy danh sách các Tour/Lịch trình được chia sẻ công khai' })
  @ApiResponse({ status: 200, description: 'Thành công trả về danh sách có phân trang' })
  async getPublicTours(@Query() query: GetToursQueryDto) {
    const result = await this.exploreService.getPublicTours(query);
    // Trải kết quả ra để khớp với format của TransformInterceptor
    return {
      message: 'Lấy danh sách khám phá thành công',
      ...result, 
    };
  }

  @Get('tours/:id')
  @ApiOperation({ summary: 'Xem chi tiết 1 Tour công khai (Lịch trình, địa điểm)' })
  async getTourDetails(@Param('id') id: string) {
    const data = await this.exploreService.getTourDetails(id);
    return {
      message: 'Lấy chi tiết tour thành công',
      data,
    };
  }
}