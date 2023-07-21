import { IMeaning } from "./entities/IMeaning";

export interface IDefinitionRepository {
  add(
    wordId: number,
    userId: string,
    definition: string,
    example?: string,
  ): Promise<void>;

  getByWordId(wordId: number, userId: string): Promise<IMeaning[]>;

  getByWord(word: string, userId: string): Promise<IMeaning[]>;

  getAll(userId: string): Promise<IMeaning[]>;
}
