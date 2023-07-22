import * as BetterSqlite3 from "better-sqlite3";
import { IWordRepository } from "../usecases/IWordRepository";
import { IWord } from "../usecases/entities/IWord";

export class WordRepository implements IWordRepository {
  private addQuery: BetterSqlite3.Statement<unknown[]>;
  private getByTextQuery: BetterSqlite3.Statement<unknown[]>;
  private getAllQuery: BetterSqlite3.Statement<unknown[]>;
  private removeByTextQuery: BetterSqlite3.Statement<unknown[]>;

  constructor(private readonly db: BetterSqlite3.Database) {
    this.addQuery = db.prepare(`INSERT INTO Words (word, userId) VALUES (?, ?)`);
    this.getByTextQuery = db.prepare(`SELECT * FROM Words WHERE userId=? AND word=? LIMIT 1`);
    this.getAllQuery = db.prepare(`SELECT * FROM Words WHERE userId=?`);
    this.removeByTextQuery = db.prepare(`DELETE FROM Words WHERE word=? AND userId=?`);
  }

  add(word: string, userId: string): Promise<number> {
    const result = this.addQuery.run([word, userId]);
    return Promise.resolve(result.lastInsertRowid as number);
  }

  getByText(word: string, userId: string): Promise<IWord | null> {
    const result = this.getByTextQuery.get([userId, word]);
    return Promise.resolve(result as IWord);
  }

  getAll(userId: string): Promise<IWord[]> {
    const result = this.getAllQuery.all([userId]);
    return Promise.resolve(result as IWord[]);
  }

  removeByText(word: string, userId: string): Promise<void> {
    this.removeByTextQuery.run([word, userId]);
    return Promise.resolve();
  }
}
