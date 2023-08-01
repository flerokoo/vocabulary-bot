import * as BetterSqlite3 from "better-sqlite3";
import { ITagRepository } from "./ITagRepository";
import { ITag } from "../entities/ITag";

export class SqliteTagRepository implements ITagRepository {
  private addOwnershipSt!: BetterSqlite3.Statement<unknown[]>;
  private getOrAddTagSt!: BetterSqlite3.Statement<unknown[]>;
  private assignTagToWordSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllTagsByUserIdSt!: BetterSqlite3.Statement<unknown[]>;
  private unassignTagSt!: BetterSqlite3.Statement<unknown[]>;
  private isTagAssignedSt!: BetterSqlite3.Statement<unknown[]>;
  private getAllTagsByUserIdAndWordIdSt!: BetterSqlite3.Statement<unknown[]>;

  constructor(private db: BetterSqlite3.Database) {}

  addOwnership(tagId: number, userId: number): Promise<void> {
    this.addOwnershipSt ??= this.db.prepare(`
      INSERT INTO TagOwnership(tagId, userId) VALUES (?, ?)
    `);
    this.addOwnershipSt.run([tagId, userId]);
    return Promise.resolve();
  }

  assignTag(userId: number, tagId: number, wordId: number): Promise<void> {
    this.assignTagToWordSt ??= this.db.prepare(`
      INSERT INTO TagToWordRelation(tagId, wordId, userId) VALUES (?, ?, ?)
    `);
    this.assignTagToWordSt.run([tagId, wordId, userId]);
    return Promise.resolve();
  }

  getAllTagsByUserId(userId: number): Promise<ITag[]> {
    this.getAllTagsByUserIdSt ??= this.db.prepare(`
      SELECT * FROM Tags AS t
      INNER JOIN TagOwnership AS tow ON tow.tagId=t.id
      WHERE tow.userId=?  
    `);
    const result = this.getAllTagsByUserIdSt.all([userId]);
    return Promise.resolve(result as ITag[]);
  }

  getOrAddTag(tag: string): Promise<ITag> {
    this.getOrAddTagSt ??= this.db.prepare(`
      INSERT INTO Tags(tag) VALUES (?)
    `);
    const result = this.getOrAddTagSt.run([tag]);
    return Promise.resolve({
      id: result.lastInsertRowid as number,
      tag,
    });
  }

  unassignTag(userId: number, tagId: number, wordId: number) {
    this.unassignTagSt ??= this.db.prepare(`
      DELETE FROM TagToWordRelation WHERE tagId=? AND wordId=? AND userId=?
    `);
    this.unassignTagSt.run([tagId, wordId, userId]);
    return Promise.resolve();
  }

  isTagAssigned(userId: number, tagId: number, wordId: number): Promise<boolean> {
    this.isTagAssignedSt ??= this.db.prepare(`
      SELECT * FROM TagToWordRelation WHERE tagId=? AND wordId=? AND userId=?
    `);
    const result = this.isTagAssignedSt.get([tagId, wordId, userId]);
    return Promise.resolve(Boolean(result));
  }

  getAllTagsByUserIdAndWordId(wordId: number, userId: number): Promise<ITag[]> {
    this.getAllTagsByUserIdAndWordIdSt ??= this.db.prepare(`
      SELECT * FROM Tags AS t
      INNER JOIN TagOwnership AS tow ON tow.tagId=t.id
      INNER JOIN TagToWordRelation AS ttw On ttw.tagId=tow.tagId
      WHERE tow.userId=? AND ttw.wordId=?
    `);
    const result = this.getAllTagsByUserIdAndWordIdSt.all([userId, wordId]);
    return Promise.resolve(result as ITag[]);
  }
}
