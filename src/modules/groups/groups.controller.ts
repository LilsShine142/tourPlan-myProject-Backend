import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetGroupsQueryDto } from './dto/get-groups-query.dto';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo nhóm chi tiêu mới' })
  async createGroup(@CurrentUser() user: any, @Body() dto: CreateGroupDto) {
    const data = await this.groupsService.createGroup(user.id, user.displayName, dto);
    return { message: 'Tạo nhóm thành công', data };
  }

  @Get('my-groups')
  @ApiOperation({ summary: 'Lấy danh sách các nhóm mình tham gia' })
  async getMyGroups(@CurrentUser() user: any, @Query() query: GetGroupsQueryDto) {
    const result = await this.groupsService.getMyGroups(user.id, query);
    return { message: 'Lấy danh sách nhóm thành công', ...result };
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Thêm thành viên vào nhóm (Hỗ trợ cả người dùng ảo không có account)' })
  async addMember(@Param('id') groupId: string, @Body() dto: AddMemberDto) {
    const data = await this.groupsService.addMemberToGroup(groupId, dto);
    return { message: 'Thêm thành viên thành công', data };
  }
}