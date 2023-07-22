import { IMeaning } from "./entities/IMeaning";

export interface IDefinitionRepository {
  add(wordId: number, userId: string, definition: string, example?: string): Promise<void>;

  getAllByWordId(wordId: number, userId: string): Promise<IMeaning[]>;

  getAllByWord(word: string, userId: string): Promise<IMeaning[]>;

  getAll(userId: string): Promise<IMeaning[]>;
}
