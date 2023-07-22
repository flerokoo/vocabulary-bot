import Database from "better-sqlite3";
import fsp from "node:fs/promises";
import { WordRepository } from "./WordRepository";
import { DefinitionRepository } from "./DefinitionRepository";
import config from "../../config";

export async function initDb() {
  // const db = new Database(config.databasePath);
  const db = new Database(":memory:");
  const installQuery = await fsp.readFile("./install/install-db.sql", "utf-8");

  db.exec(installQuery);

  const wordRepository = new WordRepository(db);
  const defRepository = new DefinitionRepository(db);
  //
  // db.exec(`INSERT INTO Words(id, word, userId) VALUES
  //   (1, 'proper', '1110'),
  //   (2, 'work', '1110'),
  //   (3, 'proper', '1234');
  // `);
  //
  // db.exec(`INSERT INTO Definitions(id, userId, word, definition) VALUES
  //   (1, '1110', 1, 'proper def 1'),
  //   (2, '1110', 1, 'proper def 2'),
  //   (3, '1110', 2, 'work def 1'),
  //   (4, '1234', 3, 'proper def 1 other user');
  // `);
  //
  // db.exec(`DELETE FROM Words WHERE id=1`)
  //
  // const qq = db.prepare(`SELECT * FROM Definitions`)
  // console.log(qq.all([]))

  const shutdown = async () => {
    db.close()
  }

  return { wordRepository, defRepository, shutdown };
}
