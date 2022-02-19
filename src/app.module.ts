import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './repository/article.entity';
import { Reply } from './repository/reply.entity';
import { Keyword } from './repository/keyword.entity';
import { ArticleController } from './article/article.controller';
import { ReplyController } from './article/reply.controller';
import { ArticleService } from './article/article.service';
import { ReplyService } from './article/reply.service';
import { config } from 'dotenv';
const { parsed: env } = config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      database: env.DATABASE_NAME,
      username: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      entities: ['dist/**/*.entity{.ts,.js}'],
      dropSchema: true,
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Article, Reply, Keyword]),
  ],
  controllers: [ArticleController, ReplyController],
  providers: [ArticleService, ReplyService],
})
export class AppModule {}
