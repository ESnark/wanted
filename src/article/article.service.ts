import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ArticleRepository } from '../repository/article.repository';
import {
  ArticleIdDto,
  BriefArticleDto,
  CreateArticleDto,
  RemoveArticleDto,
  UpdateArticleDto,
  FullArticleDto,
  SearchArticleDto,
  PagingArticleDto,
} from './dto/article.dto';

import * as bcrypt from 'bcrypt';
import { DeleteResult, FindManyOptions, ILike, UpdateResult } from 'typeorm';
import { Article } from '../repository/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { KeywordRepository } from '../repository/keyword.repository';
import { Keyword } from '../repository/keyword.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: ArticleRepository,
    @InjectRepository(Keyword)
    private readonly keywordRepository: KeywordRepository,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<ArticleIdDto> {
    const { content, password } = createArticleDto;
    const hash = await bcrypt.hash(password, 10);

    createArticleDto.password = hash;
    const { id } = await this.articleRepository.save(createArticleDto);

    await this.pulishNotification(content);
    return { id };
  }

  async findOne(id: number): Promise<FullArticleDto> {
    const article = await this.articleRepository.findOne(id);
    if (!article) throw new NotFoundException();

    return article;
  }

  async update(id: number, updateDto: UpdateArticleDto): Promise<UpdateResult> {
    const { password, ...data } = updateDto;

    const article = await this.articleRepository.findOne(id);
    if (!article) throw new NotFoundException();

    if ((await bcrypt.compare(password, article.password)) == false) {
      throw new UnauthorizedException();
    }

    return await this.articleRepository.update({ id }, data);
  }

  async remove(id: number, removeDto: RemoveArticleDto): Promise<DeleteResult> {
    const { password } = removeDto;

    // 삭제할 게시물 유무 확인
    const article = await this.articleRepository.findOne(id);
    if (!article) throw new NotFoundException();

    // 삭제할 게시물 비밀번호 확인
    const { password: hashed } = article;
    if ((await bcrypt.compare(password, hashed)) === false) {
      throw new UnauthorizedException();
    }

    return await this.articleRepository.delete({ id });
  }

  async getPage(
    pagingDto: PagingArticleDto,
  ): Promise<[BriefArticleDto[], number]> {
    const { type, keyword } = pagingDto;
    const limit = pagingDto.limit || 5;
    const page = pagingDto.page || 1;

    const findOption: FindManyOptions = {
      order: { created_at: 'DESC' },
      select: ['id', 'title', 'writer', 'created_at', 'updated_at'],
      take: limit,
      skip: (page - 1) * limit,
    };

    if (type && keyword) {
      findOption['where'] = { [type]: ILike(`%${keyword}%`) };
    }

    const [articles, _] = await this.articleRepository.findAndCount(findOption);
    if (articles.length < 1) throw new NotFoundException();

    return [articles, articles.length];
  }

  async countArticles(options: FindManyOptions<Article>): Promise<number> {
    return await this.articleRepository.count(options);
  }

  async searchArticles(
    searchOption: SearchArticleDto,
  ): Promise<[BriefArticleDto[], number]> {
    const { type, keyword } = searchOption;
    const where = { [type]: ILike(`%${keyword}%`) };

    return await this.articleRepository.findAndCount(where);
  }

  async isArticleExists(id: number) {
    const [_, n] = await this.articleRepository.findAndCount({ where: { id } });
    return n === 1;
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
