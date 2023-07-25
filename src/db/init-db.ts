import * as BetterSqlite3 from "better-sqlite3";
import fsp from "node:fs/promises";
import { SqliteWordRepository } from "./SqliteWordRepository";
import { SqliteDefinitionRepository } from "./SqliteDefinitionRepository";
import config from "../../config";
import { SqliteUserRepository } from "./SqliteUserRepository";


async function install(db: BetterSqlite3.Database) {
  const query = await fsp.readFile("./install/install-db.sql", "utf-8");
  db.exec(query);
}

async function populate(db: BetterSqlite3.Database) {
  const query = await fsp.readFile("./install/populate-test-db.sql", "utf-8");
  db.exec(query);
}

export async function initDb() {
  // const db = new Database(config.databasePath);
  const db = new BetterSqlite3.default(":memory:");
  await install(db);
  // await populate(db)

  const wordRepository = new SqliteWordRepository(db);
  const userRepository = new SqliteUserRepository(db);
  const defRepository = new SqliteDefinitionRepository(db);

  const shutdown = async () => {
    db.close();
  };

  return { wordRepository, defRepository, userRepository, shutdown };
}
