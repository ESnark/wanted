import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

/**
 * Controller -> Service
 */
export class CreateReplyDto {
  @ApiProperty({
    required: false,
    description: '다른 댓글의 id. 단독으로 작성할 경우 입력하지 않아도 됨',
  })
  reply_ref?: number;
  @ApiProperty({ description: '댓글 내용' })
  content: string;
}

export class PageReplyDto {
  @ApiProperty()
  page: number;
}

export class LimitReplyDto {
  @ApiProperty()
  limit: number;
}

export class FullReplyDto {
  id: number;
  article_id: number;
  reply_ref?: number;
  content: string;

  @Type(() => Date)
  @IsDate()
  created_at: Date;
}

export class ReplyIdDto {
  id: number;
  article_id: number;
}
