import Database from "better-sqlite3";
import fsp from "node:fs/promises";
import { WordRepository } from "./WordRepository";
import { DefinitionRepository } from "./DefinitionRepository";
import config from "../../config";

export async function initDb() {
  const db = new Database(config.databasePath);
  const installQuery = await fsp.readFile("./install/install-db.sql", "utf-8");

  db.exec(installQuery);

  const wordRepository = new WordRepository(db);
  const defRepository = new DefinitionRepository(db);
  return { wordRepository, defRepository };
}
