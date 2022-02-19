import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ArticleService } from './article.service';
import {
  CreateArticleDto,
  PagingArticleDto,
  UpdateArticleDto,
  RemoveArticleDto,
  SearchArticleDto,
} from './dto/article.dto';

@Controller('articles')
@ApiTags('게시물 API')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: '게시물 작성 API' })
  @ApiBody({ type: CreateArticleDto })
  @ApiCreatedResponse()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({
    summary: '게시물 조회',
    description: 'pagination과 검색 기능을 지원하는 API',
  })
  findAll(@Query() pagingArticleDto: PagingArticleDto) {
    return this.articleService.getPage(pagingArticleDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '개별 게시물 조회' })
  @ApiParam({ name: 'id', description: '조회할 게시물의 ID' })
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '게시물 수정',
    description: '제목 및 내용 수정이 가능합니다.',
  })
  @ApiBody({ type: UpdateArticleDto })
  @ApiParam({ name: 'id', description: '수정할 게시물의 ID' })
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시물 삭제' })
  @ApiBody({ type: RemoveArticleDto })
  @ApiParam({ name: 'id', description: '삭제할 게시물의 ID' })
  remove(@Param('id') id: string, @Body() removeArticleDto: RemoveArticleDto) {
    return this.articleService.remove(+id, removeArticleDto);
  }
}
