import { IDefinitionRepository } from "../usecases/IDefinitionRepository";
import { IMeaning } from "../usecases/entities/IMeaning";
import * as BetterSqlite3 from "better-sqlite3";

export class DefinitionRepository implements IDefinitionRepository {
  private addQuery: BetterSqlite3.Statement<unknown[]>;
  private getAllQuery: BetterSqlite3.Statement<unknown[]>;
  private getByWordIdQuery: BetterSqlite3.Statement<unknown[]>;
  private getByWordQuery: BetterSqlite3.Statement<unknown[]>;

  constructor(private readonly db: BetterSqlite3.Database) {
    this.addQuery = db.prepare(`INSERT INTO Definitions (word, definition, example, userId) VALUES (?, ?, ?, ?)`);
    this.getAllQuery = db.prepare(`SELECT * FROM Definitions WHERE userId=?`);
    this.getByWordIdQuery = db.prepare(`SELECT * FROM Definitions WHERE userId=? AND word=?`);
    this.getByWordQuery = db.prepare(`SELECT * FROM Definitions WHERE id IN 
        (SELECT id FROM Words WHERE word=? AND userId=?)`);
    // SELECT D.* FROM Definitions AS D
    //      LEFT JOIN Words AS W
    //      ON D.word = W.id AND W.word=?
  }

  add(wordId: number, userId: string, definition: string, example?: string): Promise<void> {
    this.addQuery.run([wordId, definition, example, userId]);
    return Promise.resolve();
  }

  getAll(userId: string): Promise<IMeaning[]> {
    const result = this.getAllQuery.all([userId]);
    return Promise.resolve(result as IMeaning[]);
  }

  getAllByWordId(wordId: number, userId: string): Promise<IMeaning[]> {
    const result = this.getByWordIdQuery.all([userId, wordId]);
    return Promise.resolve(result as IMeaning[]);
  }

  getAllByWord(word: string, userId: string): Promise<IMeaning[]> {
    const result = this.getByWordQuery.all([word, userId]);
    return Promise.resolve(result as IMeaning[]);
  }
}
