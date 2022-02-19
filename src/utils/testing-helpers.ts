import { createConnection, EntitySchema } from 'typeorm';
import { config } from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const { parsed: env } = config();
// eslint-disable-next-line @typescript-eslint/ban-types
type Entity = Function | string | EntitySchema<any>;

export async function getDBConnection(entities: Entity[]) {
  return await createConnection({
    type: 'mysql',
    database: env.DATABASE_NAME,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    entities,
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
}

export const getTestDBConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  database: env.DATABASE_NAME,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  dropSchema: true,
  synchronize: true,
  logging: false,
});
