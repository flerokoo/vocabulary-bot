import * as BetterSqlite3 from "better-sqlite3";
import { IWordRepository } from "./IWordRepository";
import { IWord } from "../entities/IWord";
import { ITag } from "../entities/ITag";

export class SqliteWordRepository implements IWordRepository {
  private addSt!: BetterSqlite3.Statement<unknown[]>;
  private getByWordSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllByUserSt!: BetterSqlite3.Statement<unknown[]>;
  private removeOwnershipByWordAndUserSt!: BetterSqlite3.Statement<unknown[]>;
  private addWordOwnershipSt!: BetterSqlite3.Statement<unknown[]>;
  private isWordOwnedByUserSt!: BetterSqlite3.Statement<unknown[]>;
  private getRandomByUserIdSt!: BetterSqlite3.Statement<unknown[]>;
  private getRandomByUserIdAndTagsSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllByUserIdAndTagsSt!: BetterSqlite3.Statement<unknown[]>;

  constructor(private readonly db: BetterSqlite3.Database) {
  }

  async addWord(word: string): Promise<number> {
    this.addSt ??= this.db.prepare(`INSERT OR IGNORE INTO Words (word) VALUES (?)`);
    const existing = await this.getByWord(word);
    if (existing) return existing.id as number;
    const result = this.addSt.run([word]);
    return result.lastInsertRowid as number;
  }

  addWordOwnership(wordId: number, userId: number) {
    this.addWordOwnershipSt ??= this.db.prepare(`INSERT INTO 
        WordOwnership(userId, wordId) VALUES(?, ?)`);
    const result = this.addWordOwnershipSt.run([userId, wordId]);
    return Promise.resolve(result.lastInsertRowid as number);
  }

  getByWord(word: string): Promise<IWord | null> {
    this.getByWordSt ??= this.db.prepare(`SELECT * FROM Words WHERE word=? LIMIT 1`);
    const result = this.getByWordSt.get([word]);
    return Promise.resolve(result as IWord);
  }

  getAllByUserId(userId: number): Promise<IWord[]> {
    this.getAllByUserSt ??= this.db.prepare(`
        SELECT W.id, W.word FROM Words W 
        INNER JOIN WordOwnership WO ON WO.wordId=W.id
        WHERE WO.userId=?`);
    const result = this.getAllByUserSt.all([userId]);
    return Promise.resolve(result as IWord[]);
  }

  removeOwnershipByWordAndUserId(word: string, userId: number): Promise<void> {
    this.removeOwnershipByWordAndUserSt ??= this.db.prepare(`
        DELETE FROM WordOwnership AS WO
        WHERE EXISTS (
            SELECT * FROM Words W
            WHERE W.word=? AND WO.userId=? AND WO.wordId=W.id
        )`);
    this.removeOwnershipByWordAndUserSt.run([word, userId]);
    return Promise.resolve();
  }

  isWordOwnedByUserId(word: string, userId: number): Promise<boolean> {
    this.isWordOwnedByUserSt ??= this.db.prepare(`
        SELECT * FROM WordOwnership AS WO
        INNER JOIN Words AS W ON WO.wordId=W.id
        WHERE W.word=? AND WO.userId=? LIMIT 1
        `);
    const result = this.isWordOwnedByUserSt.get([word, userId]);
    return Promise.resolve(Boolean(result));
  }

  getRandomByUserId(id: number): Promise<IWord> {
    this.getRandomByUserIdSt ??= this.db.prepare(`
      SELECT w.word, w.id  FROM Words w
          INNER JOIN WordOwnership wo ON wo.wordId = w.id
          WHERE wo.userId = ?
          ORDER BY RANDOM() 
          LIMIT 1
    `);
    const result = this.getRandomByUserIdSt.get([id]);
    return Promise.resolve(result as IWord);
  }

  getRandomByUserIdAndTags(userId: number, tags: ITag[]): Promise<IWord> {

    this.getRandomByUserIdAndTagsSt ??= this.db.prepare(`
      SELECT w.word, w.id  FROM Words w
          INNER JOIN WordOwnership wo ON wo.wordId = w.id
          INNER JOIN TagToWordRelation ttw ON ttw.wordId = w.id
          WHERE wo.userId=? AND ttw.userId=? AND ttw.tagId IN (
            SELECT value FROM json_each(?)
          ) ORDER BY RANDOM() 
          LIMIT 1
    `);
    const tagIds = tags.map((t) => t.id);

    const result = this.getRandomByUserIdAndTagsSt.get([userId, userId, JSON.stringify(tagIds)]);
    return Promise.resolve(result as IWord);

  }

  getAllByUserIdAndTags(userId: number, tags: ITag[]): Promise<IWord[]> {
    this.getAllByUserIdAndTagsSt ??= this.db.prepare(`
      SELECT w.word, w.id  FROM Words w
          INNER JOIN WordOwnership wo ON wo.wordId = w.id
          INNER JOIN TagToWordRelation ttw ON ttw.wordId = w.id
          WHERE wo.userId=? AND ttw.userId=? AND ttw.tagId IN (
            SELECT value FROM json_each(?)
          )          
    `);

    const tagIds = tags.map((t) => t.id);
    const result = this.getAllByUserIdAndTagsSt.all([userId, userId, JSON.stringify(tagIds)]);
    return Promise.resolve(result as IWord[]);
  }
}
