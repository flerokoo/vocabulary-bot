import { IWord } from "../entities/IWord";
import { ITag } from "../entities/ITag";

export interface IWordRepository {
  addWord(word: string): Promise<number>;

  addWordOwnership(wordId: number, userId: number): Promise<number>;

  getByWord(word: string): Promise<IWord | null>;

  getAllByUserId(userId: number): Promise<IWord[]>;

  getAllByUserIdAndTags(userId: number, tags: ITag[]): Promise<IWord[]>;

  removeOwnershipByWordAndUserId(word: string, userId: number): Promise<void>;

  isWordOwnedByUserId(word: string, userId: number): Promise<boolean>;

  getRandomByUserId(id: number): Promise<IWord>;

  getRandomByUserIdAndTags(userId: number, tags: ITag[]): Promise<IWord>;
}
