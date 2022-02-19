import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';
// import {  } from 'class-validator'

type searchType = 'writer' | 'title';

export class CreateArticleDto {
  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @ApiProperty({ description: '작성자명' })
  writer: string;

  @ApiProperty({ description: '비밀번호' })
  password: string;
}

export class RemoveArticleDto {
  @ApiProperty({ description: '비밀번호' })
  password: string;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @ApiProperty({ description: '비밀번호' })
  password: string;
}

export class SearchArticleDto {
  @ApiProperty()
  type: searchType;

  @ApiProperty()
  keyword: string;
}

export class PagingArticleDto {
  @ApiProperty()
  type?: searchType;

  @ApiProperty()
  keyword?: string;

  @ApiProperty()
  page?: number;

  @ApiProperty()
  limit?: number;
}

export class FullArticleDto {
  id: number;
  title: string;
  content: string;
  writer: string;
  password: string;

  @Type(() => Date)
  @IsDate()
  created_at: Date;
  @Type(() => Date)
  @IsDate()
  updated_at: Date;
}

/**
 * 검색결과, 리스트 표시 등에 사용된다.
 */
export class BriefArticleDto extends OmitType(FullArticleDto, [
  'password',
  'content',
] as const) {}

export class ArticleIdDto {
  id: number;
}
