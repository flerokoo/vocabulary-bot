import { IDefinitionRepository } from "../usecases/IDefinitionRepository";
import { IMeaning } from "../entities/IMeaning";
import * as BetterSqlite3 from "better-sqlite3";

export class SqliteDefinitionRepository implements IDefinitionRepository {
  private addSt: BetterSqlite3.Statement<unknown[]>;
  private getAllByTelegramSt: BetterSqlite3.Statement<unknown[]>;
  private getAllByWordIdAndTelegramSt: BetterSqlite3.Statement<unknown[]>;
  private removeOwnershipByIdAndTelegramSt: BetterSqlite3.Statement<unknown[]>;
  private addOwnershipSt: BetterSqlite3.Statement<unknown[]>;
  private getAllByWordAndTelegramSt: BetterSqlite3.Statement<unknown[]>;

  constructor(private readonly db: BetterSqlite3.Database) {
    // this.addSt = db.prepare(`INSERT INTO Definitions (wordId, definition) VALUES (?, ?) RETURNING id`);
    this.addSt = db.prepare(`INSERT INTO Definitions (wordId, definition) VALUES (?, ?)`);
    this.addOwnershipSt = db.prepare(`INSERT INTO DefinitionOwnership (definitionId, userId) VALUES (?, ?)`);
    this.getAllByTelegramSt = db.prepare(`
       SELECT W.id as wordId, W.word, D.id as definitionId, D.definition FROM Definitions AS D
       INNER JOIN DefinitionOwnership AS DO ON DO.definitionId=D.id
       INNER JOIN Users AS U ON U.id=DO.userId
       INNER JOIN Words AS W ON W.id=D.wordId
       WHERE U.telegram=?
    `)

    this.getAllByWordIdAndTelegramSt = db.prepare(`
       SELECT W.id as wordId, W.word, D.id as definitionId, D.definition FROM Definitions AS D
       INNER JOIN Words AS W ON W.id=D.wordId
       INNER JOIN DefinitionOwnership AS DO ON DO.definitionId=D.id
       INNER JOIN Users AS U ON U.id=DO.userId
       WHERE U.telegram=? AND W.id=?
    `)

    this.getAllByWordAndTelegramSt = db.prepare(`
       SELECT W.id as wordId, W.word, D.id as definitionId, D.definition FROM Definitions AS D
       INNER JOIN Words AS W ON W.id=D.wordId
       INNER JOIN DefinitionOwnership AS DO ON DO.definitionId=D.id
       INNER JOIN Users AS U ON U.id=DO.userId
       WHERE U.telegram=? AND W.word=?
    `)

    this.removeOwnershipByIdAndTelegramSt = db.prepare(`
      DELETE FROM DefinitionOwnership AS DO
      WHERE DO.id=? AND EXISTS (
        SELECT * FROM Users AS U WHERE U.telegram=? AND DO.userId=U.id
      )
    `)

    // this.getAllByTelegramSt = db.prepare(`SELECT * FROM Definitions WHERE userId=?`);
    // this.removeOwnershipByIdAndTelegramSt = db.prepare(`DELETE FROM Definitions WHERE id=? AND userId=?`);
    // this.getAllByWordIdAndTelegramSt = db.prepare(`SELECT * FROM Definitions WHERE userId=? AND word=?`);
    // this.getAllByWordQuery = db.prepare(`SELECT * FROM Definitions WHERE word IN
    //     (SELECT id FROM Words WHERE word=? AND userId=?)`);
    // SELECT D.* FROM Definitions AS D
    //      LEFT JOIN Words AS W
    //      ON D.word = W.id AND W.word=?
  }

  add(wordId: number, definition: string): Promise<number> {
    const result = this.addSt.run([wordId, definition]);
    return Promise.resolve(result.lastInsertRowid as number);
  }

  addOwnership(defId: number, userId: number): Promise<void> {
    this.addOwnershipSt.run([defId, userId]);
    return Promise.resolve();
  }

  getAllByTelegram(telegram: string): Promise<IMeaning[]> {
    const result = this.getAllByTelegramSt.all([telegram]);
    return Promise.resolve(result as IMeaning[]);
  }

  getAllByWordIdAndTelegram(wordId: number, telegram: string): Promise<IMeaning[]> {
    const result = this.getAllByWordIdAndTelegramSt.all([telegram, wordId]);
    return Promise.resolve(result as IMeaning[]);
  }

  getAllByWordAndTelegram(word: string, telegramId: string): Promise<IMeaning[]> {
    const result = this.getAllByWordAndTelegramSt.all([telegramId, word]);
    return Promise.resolve(result as IMeaning[]);
  }

  removeOwnershipByIdAndTelegram(id: number, userId: string) {
    this.removeOwnershipByIdAndTelegramSt.run([id, userId]);
    return Promise.resolve();
  }
}
