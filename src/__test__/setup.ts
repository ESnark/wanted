import { createConnection } from 'typeorm';
import { Article } from '../repository/article.entity';
import { Reply } from '../repository/reply.entity';
import { Keyword } from '../repository/keyword.entity';
import { config } from 'dotenv';
const { parsed: env } = config();

beforeAll(async () => {
  global.defaultConnection = await createConnection({
    type: 'mysql',
    database: env.DATABASE_NAME,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    entities: [Article, Reply, Keyword],
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
});

afterAll(async () => {
  await global.defaultConnection.close();
});
