import * as BetterSqlite3 from "better-sqlite3";
import { IUserRepository } from "./IUserRepository";
import { IUser } from "../entities/IUser";
import { reportAsyncRejection } from "../utils/catch-async-rejection-decorator";

export class SqliteUserRepository implements IUserRepository {
  private addSt!: BetterSqlite3.Statement<unknown[]>;
  private getSt!: BetterSqlite3.Statement<unknown[]>;

  constructor(private db: BetterSqlite3.Database) {

  }

  @reportAsyncRejection
  getOrAdd(telegramId: string): Promise<IUser> {
    this.getSt ??= this.db.prepare(`SELECT * FROM Users WHERE telegram=?`);
    this.addSt ??= this.db.prepare(`INSERT OR IGNORE INTO Users(telegram) VALUES(?)`);
    const existing = this.getSt.get([telegramId]);
    if (existing) {
      return Promise.resolve(existing as IUser);
    }
    const result = this.addSt.run([telegramId]);

    return Promise.resolve({
      id: result.lastInsertRowid as number,
      telegram: telegramId
    });
  }
}
