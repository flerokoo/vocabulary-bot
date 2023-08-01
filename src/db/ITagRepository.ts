import { ITag } from "../entities/ITag";

export interface ITagRepository {
  addOwnership(tagId: number, userId: number): Promise<void>;

  assignTag(userId: number, tagId: number, wordId: number): Promise<void>;

  getAllTagsByUserId(userId: number): Promise<ITag[]>;

  getAllTagsByUserIdAndWordId(wordId: number, userId: number): Promise<ITag[]>;

  getOrAddTag(tag: string): Promise<ITag>;

  unassignTag(userId: number, tagId: number, wordId: number): Promise<void>;

  isTagAssigned(userId: number, tagId: number, wordId: number): Promise<boolean>;
}
