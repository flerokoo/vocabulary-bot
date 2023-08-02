import * as BetterSqlite3 from "better-sqlite3";
import { ITagRepository } from "./ITagRepository";
import { ITag } from "../entities/ITag";
import { reportAsyncRejection } from "../utils/catch-async-rejection-decorator";

export class SqliteTagRepository implements ITagRepository {
  private addOwnershipSt!: BetterSqlite3.Statement<unknown[]>;
  private getOrAddTagSt!: BetterSqlite3.Statement<unknown[]>;
  private assignTagToWordSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllTagsByUserIdSt!: BetterSqlite3.Statement<unknown[]>;
  private unassignTagSt!: BetterSqlite3.Statement<unknown[]>;
  private isTagAssignedSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllTagsByUserIdAndWordIdSt!: BetterSqlite3.Statement<unknown[]>;
  private getTagByTextSt!: BetterSqlite3.Statement<unknown[]>;

  constructor(private db: BetterSqlite3.Database) {}

  @reportAsyncRejection
  addOwnership(tagId: number, userId: number): Promise<void> {
    this.addOwnershipSt ??= this.db.prepare(`
      INSERT INTO TagOwnership(tagId, userId) VALUES (?, ?)
    `);
    this.addOwnershipSt.run([tagId, userId]);
    return Promise.resolve();
  }

  @reportAsyncRejection
  assignTag(userId: number, tagId: number, wordId: number): Promise<void> {
    this.assignTagToWordSt ??= this.db.prepare(`
      INSERT INTO TagToWordRelation(tagId, wordId, userId) VALUES (?, ?, ?)
    `);
    this.assignTagToWordSt.run([tagId, wordId, userId]);
    return Promise.resolve();
  }

  @reportAsyncRejection
  getAllTagsByUserId(userId: number): Promise<ITag[]> {
    this.getAllTagsByUserIdSt ??= this.db.prepare(`
      SELECT t.id, t.tag FROM Tags AS t
      INNER JOIN TagOwnership AS tow ON tow.tagId=t.id
      WHERE tow.userId=?  
    `);
    const result = this.getAllTagsByUserIdSt.all([userId]);
    return Promise.resolve(result as ITag[]);
  }

  @reportAsyncRejection
  getOrAddTag(tag: string): Promise<ITag> {
    this.getOrAddTagSt ??= this.db.prepare(`
      INSERT OR IGNORE INTO Tags(tag) VALUES (?)
    `);
    this.getOrAddTagSt.run([tag]);

    this.getTagByTextSt ??= this.db.prepare(`
      SELECT * from Tags WHERE tag=?
    `);

    const tagObject = this.getTagByTextSt.get([tag]);
    return Promise.resolve(tagObject as ITag);
  }

  @reportAsyncRejection
  unassignTag(userId: number, tagId: number, wordId: number) {
    this.unassignTagSt ??= this.db.prepare(`
      DELETE FROM TagToWordRelation WHERE tagId=? AND wordId=? AND userId=?
    `);
    this.unassignTagSt.run([tagId, wordId, userId]);
    return Promise.resolve();
  }

  @reportAsyncRejection
  isTagAssigned(userId: number, tagId: number, wordId: number): Promise<boolean> {
    this.isTagAssignedSt ??= this.db.prepare(`
      SELECT * FROM TagToWordRelation WHERE tagId=? AND wordId=? AND userId=?
    `);
    const result = this.isTagAssignedSt.get([tagId, wordId, userId]);
    return Promise.resolve(Boolean(result));
  }

  @reportAsyncRejection
  getAllTagsByUserIdAndWordId(wordId: number, userId: number): Promise<ITag[]> {
    this.getAllTagsByUserIdAndWordIdSt ??= this.db.prepare(`
      SELECT t.id, t.tag FROM Tags AS t
      INNER JOIN TagOwnership AS tow ON tow.tagId=t.id
      INNER JOIN TagToWordRelation AS ttw On ttw.tagId=tow.tagId
      WHERE tow.userId=? AND ttw.wordId=?
    `);
    const result = this.getAllTagsByUserIdAndWordIdSt.all([userId, wordId]);
    return Promise.resolve(result as ITag[]);
  }
}
