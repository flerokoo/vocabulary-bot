import * as BetterSqlite3 from "better-sqlite3";
import fsp from "node:fs/promises";
import { SqliteWordRepository } from "./SqliteWordRepository";
import { SqliteDefinitionRepository } from "./SqliteDefinitionRepository";
import { SqliteUserRepository } from "./SqliteUserRepository";
import { SqliteTagRepository } from "./SqliteTagRepository";
import { isProduction } from "../utils/is-production";

async function execFile(db: BetterSqlite3.Database, filePath: string) {
  const ENCODING = "utf-8";
  try {
    const query = await fsp.readFile(filePath, ENCODING);
    db.exec(query);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const install = async (db: BetterSqlite3.Database) => await execFile(db, "./install/install-db.sql");

const populate = async (db: BetterSqlite3.Database) => await execFile(db, "./install/populate-test-db.sql");

export async function initDb({ dbPath }: { dbPath: string }) {
  // const db = new BetterSqlite3.default(":memory:");
  const db = new BetterSqlite3.default(dbPath);
  await install(db);
  // await populate(db);

  const wordRepository = new SqliteWordRepository(db);
  const userRepository = new SqliteUserRepository(db);
  const defRepository = new SqliteDefinitionRepository(db);
  const tagRepository = new SqliteTagRepository(db);

  const shutdown = async () => {
    db.close();
  };

  return { wordRepository, defRepository, userRepository, tagRepository, shutdown };
}
