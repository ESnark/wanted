import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { CreateReplyDto, PageReplyDto, LimitReplyDto } from './dto/reply.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('articles/:articleId/replies')
@ApiTags('댓글 API')
export class ReplyController {
  constructor(private readonly repliesService: ReplyService) {}

  @Post()
  @ApiOperation({ summary: '댓글 작성 API' })
  @ApiParam({ name: 'articleId', description: '댓글을 작성할 게시물의 ID' })
  create(
    @Param('articleId') article_id: number,
    @Body() createReplyDto: CreateReplyDto,
  ) {
    return this.repliesService.create(+article_id, createReplyDto);
  }

  @Get()
  @ApiOperation({ summary: '댓글 조회 API' })
  @ApiParam({ name: 'articleId', description: '댓글을 조회할 게시물의 ID' })
  @ApiQuery({ name: 'page', type: PageReplyDto })
  @ApiQuery({ name: 'limit', type: LimitReplyDto })
  getPage(
    @Param('articleId') article_id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ) {
    return this.repliesService.getPage(+article_id, page, limit);
  }
}
