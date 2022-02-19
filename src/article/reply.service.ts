import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleService } from './article.service';
import { ReplyRepository } from '../repository/reply.repository';
import { CreateReplyDto, ReplyIdDto } from './dto/reply.dto';
import { Reply } from '../repository/reply.entity';
import { KeywordRepository } from '../repository/keyword.repository';
import { Keyword } from '../repository/keyword.entity';

@Injectable()
export class ReplyService {
  constructor(
    @InjectRepository(Reply) private readonly replyRepository: ReplyRepository,
    private readonly articleService: ArticleService,
    @InjectRepository(Keyword)
    private readonly keywordRepository: KeywordRepository,
  ) {}

  async create(
    article_id: number,
    createReplyDto: CreateReplyDto,
  ): Promise<ReplyIdDto> {
    const { reply_ref } = createReplyDto;

    // 게시물 존재여부 확인
    const article = await this.articleService.isArticleExists(article_id);
    //  (Exception) 존재하지 않는 게시글에 댓글작성을 시도하는 경우
    if (!article) throw new BadRequestException();

    // 댓글에 다는 댓글인 경우
    if (reply_ref) {
      const parentReply = await this.replyRepository.findOne(reply_ref);

      // (Exception) 부모 댓글이 존재하지 않는 경우
      // (Exception) 부모 댓글이 이미 다른 댓글의 자식인 경우
      // (Exception) 부모 댓글의 article_id가 작성할 댓글의 article_id와 일치하지 않는 경우

      if (
        !parentReply ||
        Number.isInteger(parentReply.reply_ref) ||
        parentReply.article_id !== article_id
      ) {
        throw new BadRequestException();
      }
    }

    const result = await this.replyRepository.save({
      article_id,
      ...createReplyDto,
    });

    // Unlikely to happend
    if (!result) throw new InternalServerErrorException();

    this.pulishNotification(result.content);

    const { id } = result;
    return { id, article_id };
  }

  async getPage(
    article_id: number,
    page: number,
    limit: number,
  ): Promise<[Reply[], number]> {
    const [replies, _] = await this.replyRepository.findAndCount({
      where: { article_id },
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    if (replies.length < 1) throw new NotFoundException();
    return [replies, replies.length];
  }

  async pulishNotification(text: string) {
    const matchedKeywords = await this.keywordRepository
      .createQueryBuilder('keyword')
      .where(":text like CONCAT('%', keyword.content, '%')", { text })
      .getMany();

    for (const matched of matchedKeywords) {
      Logger.log(
        `Notification published for ${matched.id}:${matched.writer}:${matched.content}`,
      );
    }
  }
}
