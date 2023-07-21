import { IWordRepository } from "../usecases/IWordRepository";
import { IWord } from "../usecases/entities/IWord";

export class WordRepository implements IWordRepository {
  private addQuery: BetterSqlite3.Statement<unknown[]>;

  constructor(private readonly db: BetterSqlite3.Database) {
    // const db = new Database("")
    this.addQuery = db.prepare(
      `INSERT INTO Words (word, userId) VALUES (?, ?)`,
    );
  }

  add(word: string, userId: string): Promise<number> {
    const result = this.addQuery.run([word, userId]);
    return Promise.resolve(result.lastInsertRowid);
  }

  getByText(word: string, userId: string): Promise<IWord | null> {
    return new Promise((resolve, _) => {
      const callback = (err: never, result: unknown) => {
        if (err) throw new Error();
        if (Array.isArray(result) && result.length > 0)
          resolve(result[0] as IWord);
        else resolve(null);
      };
      const query = `SELECT * FROM Words WHERE userId='${userId}' AND word='${word}' LIMIT 1`;
      this.db.all(query, callback);
    });
  }

  getAll(userId: string): Promise<IWord[]> {
    return new Promise((resolve, _) => {
      const callback = (err: never, result: unknown) => {
        if (err) throw new Error();
        resolve(result as IWord[]);
      };
      const query = `SELECT * FROM Words WHERE userId='${userId}'`;
      this.db.all(query, callback);
    });
  }
}
