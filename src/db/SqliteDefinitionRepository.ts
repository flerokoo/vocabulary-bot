import { IDefinitionRepository } from "./IDefinitionRepository";
import { IMeaning } from "../entities/IMeaning";
import * as BetterSqlite3 from "better-sqlite3";
import { reportAsyncRejection } from "../utils/catch-async-rejection-decorator";

export class SqliteDefinitionRepository implements IDefinitionRepository {
  private addSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllByTelegramSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllByWordIdAndTelegramSt!: BetterSqlite3.Statement<unknown[]>;
  private removeOwnershipByIdAndUserIdSt!: BetterSqlite3.Statement<unknown[]>;
  private addOwnershipSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllByWordAndTelegramSt!: BetterSqlite3.Statement<unknown[]>;
  private getRandomByUserIdSt!: BetterSqlite3.Statement<unknown[]>;

  constructor(private readonly db: BetterSqlite3.Database) {}

  @reportAsyncRejection
  add(wordId: number, definition: string): Promise<number> {
    this.addSt ??= this.db.prepare(`INSERT INTO Definitions (wordId, definition) VALUES (?, ?)`);
    const result = this.addSt.run([wordId, definition]);
    return Promise.resolve(result.lastInsertRowid as number);
  }

  @reportAsyncRejection
  addOwnership(defId: number, userId: number): Promise<void> {
    this.addOwnershipSt ??= this.db.prepare(`INSERT INTO DefinitionOwnership (definitionId, userId) VALUES (?, ?)`);
    this.addOwnershipSt.run([defId, userId]);
    return Promise.resolve();
  }

  @reportAsyncRejection
  getAllByUserId(userId: number): Promise<IMeaning[]> {
    this.getAllByTelegramSt ??= this.db.prepare(`
       SELECT W.id as wordId, W.word, D.id as definitionId, D.definition FROM Definitions AS D
       INNER JOIN DefinitionOwnership AS DO ON DO.definitionId=D.id
       INNER JOIN Words AS W ON W.id=D.wordId
       WHERE DO.userId=?
    `);
    const result = this.getAllByTelegramSt.all([userId]);
    return Promise.resolve(result as IMeaning[]);
  }

  @reportAsyncRejection
  getAllByWordIdAndUserId(wordId: number, userId: number): Promise<IMeaning[]> {
    this.getAllByWordIdAndTelegramSt ??= this.db.prepare(`
       SELECT W.id as wordId, W.word, D.id as definitionId, D.definition FROM Definitions AS D
       INNER JOIN Words AS W ON W.id=D.wordId
       INNER JOIN DefinitionOwnership AS DO ON DO.definitionId=D.id
       WHERE DO.userId=? AND W.id=?
    `);
    const result = this.getAllByWordIdAndTelegramSt.all([userId, wordId]);
    return Promise.resolve(result as IMeaning[]);
  }

  @reportAsyncRejection
  getAllByWordAndUserId(word: string, userId: number): Promise<IMeaning[]> {
    this.getAllByWordAndTelegramSt ??= this.db.prepare(`
       SELECT W.id as wordId, W.word, D.id as definitionId, D.definition FROM Definitions AS D
       INNER JOIN Words AS W ON W.id=D.wordId
       INNER JOIN DefinitionOwnership AS DO ON DO.definitionId=D.id
       WHERE DO.userId=? AND W.word=?
    `);
    const result = this.getAllByWordAndTelegramSt.all([userId, word]);
    return Promise.resolve(result as IMeaning[]);
  }

  @reportAsyncRejection
  removeOwnershipByIdAndUserId(id: number, userId: number) {
    this.removeOwnershipByIdAndUserIdSt ??= this.db.prepare(`
      DELETE FROM DefinitionOwnership AS DO
      WHERE DO.id=? AND DO.userId=?
    `);
    this.removeOwnershipByIdAndUserIdSt.run([id, userId]);
    return Promise.resolve();
  }

  @reportAsyncRejection
  getRandomByUserId(userId: number): Promise<{ word: string; definition: string }> {
    this.getRandomByUserIdSt ??= this.db.prepare(`
      SELECT w.word, d.definition  FROM Definitions d 
          INNER JOIN DefinitionOwnership do ON do.definitionId = d.id
          INNER JOIN Words w ON w.id = d.wordId 
          WHERE DO.userId = ?
          ORDER BY RANDOM() 
          LIMIT 1
    `);
    const result = this.getRandomByUserIdSt.get([userId]);
    return Promise.resolve(result as { word: string; definition: string });
  }
}
