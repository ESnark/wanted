import { ArticleService } from '../article/article.service';
import { Article } from '../repository/article.entity';
import { getConnection, Repository } from 'typeorm';
import { CreateArticleDto } from '../article/dto/article.dto';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Keyword } from '../repository/keyword.entity';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let articleRepository: Repository<Article>;
  let keywordRepository: Repository<Keyword>;

  const testInput: CreateArticleDto = {
    title: 'hello',
    content: 'world',
    writer: '테스터',
    password: 'aaiiee',
  };
  let createdId;

  beforeAll(async () => {
    const db = getConnection();
    articleRepository = db.getRepository(Article);
    keywordRepository = db.getRepository(Keyword);
    articleService = new ArticleService(articleRepository, keywordRepository);
  });

  it('should be defined', () => {
    expect(articleService).toBeDefined();
  });

  describe('CRUD Test', () => {
    test('[create] 정상적으로 DB에 기록되는지 확인한다.', async () => {
      const { id } = await articleService.create({ ...testInput });
      createdId = id;

      expect(typeof id).toEqual('number');
    });

    test('[findOne] 입력된 값과 일치하는지 확인한다.', async () => {
      const article = await articleService.findOne(createdId);

      const { password, ...restInput } = testInput;
      const { password: hashed, ...restArticle } = article;
      expect(restArticle).toMatchObject(restInput);

      const isSamePassword = await bcrypt.compare(password, hashed);
      expect(isSamePassword).toEqual(true);
    });

    test('[findOne] 존재하지 않는 게시물을 조회 시도하면 NotFoundException', async () => {
      const findOnePromise = articleService.findOne(99999);

      await expect(findOnePromise).rejects.toThrowError(NotFoundException);
    });

    test('[update] 존재하지 않는 게시물을 수정할 수 없다.', async () => {
      const updatePromise = articleService.update(9999, {
        password: testInput.password,
      });
      await expect(updatePromise).rejects.toThrowError(NotFoundException);
    });

    test('[update] 비밀번호가 일치하지 않으면 게시글을 수정할 수 없다.', async () => {
      const updatePromise = articleService.update(createdId, {
        password: 'wrong password',
      });
      await expect(updatePromise).rejects.toThrowError(UnauthorizedException);
    });

    test('[update] 제목 & 내용 & 수정일자의 변경사항을 확인한다.', async () => {
      const title = '새 제목';
      const content = '새 내용';
      const { password } = testInput;

      // 수정 전 updated_at 데이터 저장
      const { updated_at } = await articleService.findOne(createdId);

      const { affected } = await articleService.update(createdId, {
        title,
        content,
        password,
      });

      expect(affected).toEqual(1);

      const article = await articleService.findOne(createdId);
      expect(title).toEqual(article.title);
      expect(content).toEqual(article.content);
      expect(updated_at).not.toEqual(article.updated_at);
    });

    test('[delete] 존재하지 않는 게시물을 삭제할 수 없다.', async () => {
      const deletePromise = articleService.remove(9999, {
        password: testInput.password,
      });
      await expect(deletePromise).rejects.toThrowError(NotFoundException);
    });

    test('[delete] 비밀번호가 일치하지 않으면 게시물을 삭제할 수 없다.', async () => {
      const deletePromise = articleService.remove(createdId, {
        password: 'Wrong password',
      });
      await expect(deletePromise).rejects.toThrowError(UnauthorizedException);
    });

    test('[delete] 게시물 삭제 후 삭제 여부를 확인한다.', async () => {
      const { affected } = await articleService.remove(createdId, {
        password: testInput.password,
      });

      expect(affected).toEqual(1);

      const count = await articleService.countArticles({
        where: { id: createdId },
      });
      expect(count).toEqual(0);
    });
  });

  describe('Pagination & 리스트 조회', () => {
    test('[getPage] 조회 결과가 없으면 NotFoundException', async () => {
      const getPromise = articleService.getPage({ limit: 10, page: 100 });

      await expect(getPromise).rejects.toThrowError(NotFoundException);
    });

    test('[getPage] 20개의 게시글에서 limit=5를 기준으로 두번째 페이지 제목은 6~10이 된다(최신순 정렬)', async () => {
      // 순서대로 20개 게시글 생성
      for (let i = 1; i <= 20; i++) {
        await articleService.create({
          title: '' + i,
          content: '',
          writer: '작성자 검색' + (i % 2),
          password: '1234',
        });
      }

      const [articles, n] = await articleService.getPage({ limit: 5, page: 2 });
      expect(articles.map(({ title }) => parseInt(title))).toEqual([
        15, 14, 13, 12, 11,
      ]);
    });
  });

  describe('[getPage] 게시물 검색: 게시글을 7개 생성하고 작성자 or 제목 조건으로 검색한다.', () => {
    describe('게시물 작성', () => {
      test('', async () => {
        for (let i = 1; i <= 3; i++) {
          await articleService.create({
            title: '테스트용 제목 ' + i,
            content: '내용 없음',
            writer: '개발자 1',
            password: '1234',
          });
        }
        for (let i = 1; i <= 3; i++) {
          await articleService.create({
            title: '테스트용 제목 ' + i,
            content: '내용 없음',
            writer: '개발자 2',
            password: '1234',
          });
        }

        await articleService.create({
          title: 'A1phaNumeric search (case insensitive)',
          content: 'no content',
          writer: 'deve1oper 1',
          password: '1234',
        });
      });
    });

    describe('게시물 테스트', () => {
      test('"테스트용 제목 1"이라는 제목의 게시물은 2건이다.', async () => {
        const [articles, n] = await articleService.getPage({
          type: 'title',
          keyword: '테스트용 제목 1',
        });
        expect(n).toEqual(2);

        for (const { title } of articles) {
          expect(title).toEqual('테스트용 제목 1');
        }
      });

      test('"테스트용 제목"이라는 텍스트를 포함하는 게시물은 6건이다.', async () => {
        const [articles, n] = await articleService.getPage({
          type: 'title',
          keyword: '테스트용 제목',
          limit: 6,
        });
        expect(n).toEqual(6);

        for (const { title } of articles) {
          expect(title).toMatch(/테스트용 제목/);
        }
      });

      test('"테스트용 제목"이라는 텍스트를 limit=2로 검색하면 3페이지가 나온다.', async () => {
        const titles = [];

        for (let i = 1; i <= 3; i++) {
          const [articles, n] = await articleService.getPage({
            type: 'title',
            keyword: '테스트용 제목',
            limit: 2,
            page: i,
          });

          expect(n).toEqual(2);
          titles.push(...articles.map(({ title }) => title));
        }

        for (const title of titles) {
          expect(title).toMatch(/테스트용 제목/);
        }
      });

      test('"개발자 1" 작성자가 쓴 게시물은 3건이다.', async () => {
        const [articles, n] = await articleService.getPage({
          type: 'writer',
          keyword: '개발자 1',
        });
        expect(n).toEqual(3);

        for (const { writer } of articles) {
          expect(writer).toEqual('개발자 1');
        }
      });

      test('작성자 명에 "개발자"라는 텍스트가 포함되는 게시물은 6건이다.', async () => {
        const [articles, n] = await articleService.getPage({
          type: 'writer',
          keyword: '개발자',
          limit: 6,
        });
        expect(n).toEqual(6);

        for (const { writer } of articles) {
          expect(writer).toMatch(/개발자/);
        }
      });

      test('"1PHA" 제목으로 검색되는 게시물은 1건이다.', async () => {
        const [_, n] = await articleService.getPage({
          type: 'title',
          keyword: '1PHA',
        });
        expect(n).toEqual(1);
      });

      test('"eve1op" 작성자명으로 검색되는 게시물은 1건이다.', async () => {
        const [_, n] = await articleService.getPage({
          type: 'writer',
          keyword: 'eve1op',
        });
        expect(n).toEqual(1);
      });
    });
  });
});
