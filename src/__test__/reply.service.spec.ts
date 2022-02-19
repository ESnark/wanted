import { ReplyService } from '../article/reply.service';
import { Reply } from '../repository/reply.entity';
import { ArticleService } from '../article/article.service';
import { Article } from '../repository/article.entity';
import { Keyword } from '../repository/keyword.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getConnection, Repository } from 'typeorm';
import { ArticleIdDto } from '../article/dto/article.dto';

describe('ReplyService', () => {
  let articleService: ArticleService;
  let articleRepository: Repository<Article>;
  let replyService: ReplyService;
  let replyRepository: Repository<Reply>;
  let keywordRepository: Repository<Keyword>;

  let testArticleId_1: number;
  let testArticleId_2: number;
  let testReplyId_1: number;
  let testReplyId_2: number;

  beforeAll(async () => {
    // db = await getDBConnection([Article, Reply, Keyword]);
    const db = getConnection();
    articleRepository = db.getRepository(Article);
    replyRepository = db.getRepository(Reply);
    keywordRepository = db.getRepository(Keyword);
    articleService = new ArticleService(articleRepository, keywordRepository);
    replyService = new ReplyService(
      replyRepository,
      articleService,
      keywordRepository,
    );

    // 게시물 2개 미리 작성
    const dto = {
      content: 'No Content',
      writer: 'Tester',
      password: '1234',
    };
    const article_1 = await articleService.create({
      title: '테스트 1',
      ...dto,
    });
    const article_2 = await articleService.create({
      title: '테스트 2',
      ...dto,
    });

    testArticleId_1 = article_1.id;
    testArticleId_2 = article_2.id;
  });

  it('should be defined', () => {
    expect(testArticleId_1).toBeDefined();
    expect(testArticleId_2).toBeDefined();
    expect(replyService).toBeDefined();
    expect(articleService).toBeDefined();
  });

  describe('[create] 작성 테스트', () => {
    test('[create] 정상적으로 댓글이 등록되는지 확인한다.', async () => {
      const reply = await replyService.create(testArticleId_1, {
        content: 'test 1',
      });

      expect(reply).toBeDefined();
      testReplyId_1 = reply.id;
    });
    test('[create] 댓글에 댓글이 등록되는지 확인한다', async () => {
      const reply = await replyService.create(testArticleId_1, {
        reply_ref: testReplyId_1,
        content: 'test 2',
      });

      expect(reply).toBeDefined();
      testReplyId_2 = reply.id;
    });
    test('[create] 존재하지 않는 게시글에는 댓글을 달 수 없다.', async () => {
      const createPromise = replyService.create(9999, {
        content: 'No Content',
      });

      await expect(createPromise).rejects.toThrowError(BadRequestException);
    });
    test('[create] 존재하지 않는 댓글에는 댓글을 달 수 없다.', async () => {
      const createPromise = replyService.create(testArticleId_1, {
        reply_ref: 9999,
        content: 'No Content',
      });

      await expect(createPromise).rejects.toThrowError(BadRequestException);
    });

    test('[create] 부모 댓글의 article_id가 작성하려는 게시글의 id와 일치하지 않으면 작성할 수 없다.', async () => {
      const createPromise = replyService.create(testArticleId_2, {
        reply_ref: testReplyId_1,
        content: 'No Content',
      });

      await expect(createPromise).rejects.toThrowError(BadRequestException);
    });
    test('[create] 부모 댓글에 reply_ref가 이미 명시되어 있으면 작성할 수 없다.', async () => {
      const createPromise = replyService.create(testArticleId_1, {
        reply_ref: testReplyId_2,
        content: 'No Content',
      });

      await expect(createPromise).rejects.toThrowError(BadRequestException);
    });
  });

  describe('[getPage] 조회 테스트', () => {
    // test('[pagination] 조회 결과 수가 0이면 Not Found', async() => {});
    // test('[pagination] 10개의 댓글에서 limit=3을 기준으로 두번째 페이지 댓글 내용은 5~7이 된다(최신순 정렬)', async() => {});
    let article: ArticleIdDto;
    test('', async () => {
      article = await articleService.create({
        title: '테스트 3',
        content: 'No Content',
        writer: 'Tester',
        password: '1234',
      });

      expect(article).toBeDefined();
    });

    test('존재하지 않는 게시물의 댓글을 조회하면 Not Found', async () => {
      const getPromise = replyService.getPage(99999, 2, 3);
      await expect(getPromise).rejects.toThrowError(NotFoundException);
    });
    test('조회 결과 수가 0이면 Not Found', async () => {
      const getPromise = replyService.getPage(article.id, 2, 3);
      await expect(getPromise).rejects.toThrowError(NotFoundException);
    });
    test('10개의 댓글에서 limit=3을 기준으로 두번째 페이지 댓글 내용은 2~4가 된다(최신순 정렬)', async () => {
      for (let i = 1; i <= 10; i++) {
        await replyService.create(article.id, { content: '' + i });
      }

      const [replies, n] = await replyService.getPage(article.id, 2, 3);

      expect(n).toEqual(3);
      expect(replies.map((r) => Number.parseInt(r.content))).toEqual([7, 6, 5]);
    });
  });
});
