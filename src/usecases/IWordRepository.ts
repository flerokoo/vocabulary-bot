import { IWord } from "./entities/IWord";

export interface IWordRepository {
  add(word: string, userId: string): Promise<number>;

  getAll(userId: string): Promise<IWord[]>;

  getByText(word: string, userId: string): Promise<IWord | null>;

  removeByText(word: string, userId: string): Promise<void>;
}
