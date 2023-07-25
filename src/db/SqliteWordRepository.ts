import * as BetterSqlite3 from "better-sqlite3";
import { IWordRepository } from "./IWordRepository";
import { IWord } from "../entities/IWord";

export class SqliteWordRepository implements IWordRepository {
  private addSt: BetterSqlite3.Statement<unknown[]>;
  private getByWordSt: BetterSqlite3.Statement<unknown[]>;
  private getAllByUserSt: BetterSqlite3.Statement<unknown[]>;
  private removeOwnershipByWordAndUserSt: BetterSqlite3.Statement<unknown[]>;
  private addWordOwnershipSt: BetterSqlite3.Statement<unknown[]>;
  private isWordOwnedByTelegramSt: BetterSqlite3.Statement<unknown[]>;

  constructor(private readonly db: BetterSqlite3.Database) {
    this.addSt = db.prepare(`INSERT OR IGNORE INTO Words (word) VALUES (?)`);
    this.getByWordSt = db.prepare(`SELECT * FROM Words WHERE word=? LIMIT 1`);
    this.getAllByUserSt = db.prepare(`
        SELECT W.id, W.word FROM Words W 
        INNER JOIN WordOwnership WO ON WO.wordId=W.id
        INNER JOIN Users U ON U.id=WO.userId
        WHERE U.telegram=?`);
    this.addWordOwnershipSt = db.prepare(`INSERT INTO 
        WordOwnership(userId, wordId) VALUES(?, ?)`);
    this.removeOwnershipByWordAndUserSt = db.prepare(`
        DELETE FROM WordOwnership AS WO
        WHERE EXISTS (
            SELECT * FROM Words W
            INNER JOIN Users U ON U.id=WO.userId
            WHERE W.word=? AND U.telegram=? AND WO.userId=U.id AND WO.wordId=W.id
        )`);

    this.isWordOwnedByTelegramSt = db.prepare(`
        SELECT * FROM WordOwnership AS WO
        INNER JOIN Users AS U ON U.id=WO.userId
        INNER JOIN Words AS W ON WO.wordId=W.id
        WHERE W.word=? AND U.telegram=? LIMIT 1
        `)
  }

  async addWord(word: string): Promise<number> {
    const existing = await this.getByWord(word);
    if (existing) return existing.id;
    const result = this.addSt.run([word]);
    return result.lastInsertRowid as number;
  }

  addWordOwnership(wordId: number, userId: number) {
    const result = this.addWordOwnershipSt.run([userId, wordId]);
    return Promise.resolve(result.lastInsertRowid as number);
  }

  getByWord(word: string): Promise<IWord | null> {
    const result = this.getByWordSt.get([word]);
    return Promise.resolve(result as IWord);
  }

  getAllByTelegramId(userId: string): Promise<IWord[]> {
    const result = this.getAllByUserSt.all([userId]);
    return Promise.resolve(result as IWord[]);
  }

  removeOwnershipByWordAndTelegram(word: string, userId: string): Promise<void> {
    this.removeOwnershipByWordAndUserSt.run([word, userId]);
    return Promise.resolve();
  }

  isWordOwnedByTelegram(word: string, telegram: string): Promise<boolean> {
    const result = this.isWordOwnedByTelegramSt.get([word, telegram]);
    return Promise.resolve(Boolean(result));
  }
}
