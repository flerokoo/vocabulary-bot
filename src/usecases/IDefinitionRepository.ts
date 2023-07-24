import { IMeaning } from "../entities/IMeaning";

export interface IDefinitionRepository {
  add(wordId: number, definition: string): Promise<number>;

  getAllByWordIdAndTelegram(wordId: number, userId: string): Promise<IMeaning[]>;

  getAllByWordAndTelegram(word: string, userId: string): Promise<IMeaning[]>;

  getAllByTelegram(userId: string): Promise<IMeaning[]>;

  removeOwnershipByIdAndTelegram(id: number, userId: string): Promise<void>;

  addOwnership(defId: number, userId: number): Promise<void>;
}
