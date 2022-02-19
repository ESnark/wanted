import { EntityRepository, Repository } from 'typeorm';
import { Keyword } from './keyword.entity';

@EntityRepository(Keyword)
export class KeywordRepository extends Repository<Keyword> {}
