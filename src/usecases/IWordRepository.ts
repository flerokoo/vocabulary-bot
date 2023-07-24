import { IWord } from "../entities/IWord";

export interface IWordRepository {
  addWord(word: string): Promise<number>;

  getAllByTelegramId(userId: string): Promise<IWord[]>;

  getByWord(word: string): Promise<IWord | null>;

  removeOwnershipByWordAndTelegram(word: string, userId: string): Promise<void>;

  addWordOwnership(wordId: number, userId: number): Promise<number>;

  isWordOwnedByTelegram(word: string, telegram: string): Promise<boolean>;
}
