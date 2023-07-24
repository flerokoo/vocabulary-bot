import * as BetterSqlite3 from "better-sqlite3";
import { IUserRepository } from "../usecases/IUserRepository";
import { IUser } from "../entities/IUser";

export class SqliteUserRepository implements IUserRepository {
  private addSt: BetterSqlite3.Statement<unknown[]>;
  private getSt: BetterSqlite3.Statement<unknown[]>;

  constructor(private db: BetterSqlite3.Database) {
    this.getSt = db.prepare(`SELECT * FROM Users WHERE telegram=?`)
    this.addSt = db.prepare(`INSERT OR IGNORE INTO Users(telegram) VALUES(?)`);
  }

  getOrAdd(telegramId: string): Promise<IUser> {
    const existing = this.getSt.get([telegramId]);
    if (existing) {
      return Promise.resolve(existing as IUser)
    }
    const result = this.addSt.run([telegramId])

    return Promise.resolve({
      id: result.lastInsertRowid as number,
      telegram: telegramId
    });
  }

}