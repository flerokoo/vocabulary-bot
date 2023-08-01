import { IMeaning } from "../entities/IMeaning";

export interface IDefinitionRepository {
  add(wordId: number, definition: string): Promise<number>;

  addOwnership(defId: number, userId: number): Promise<void>;

  getAllByUserId(userId: number): Promise<IMeaning[]>;

  getAllByWordIdAndUserId(wordId: number, userId: number): Promise<IMeaning[]>;

  getAllByWordAndUserId(word: string, userId: number): Promise<IMeaning[]>;

  removeOwnershipByIdAndUserId(id: number, userId: number): Promise<void>;

  getRandomByUserId(userId: number): Promise<{ word: string; definition: string }>;
}
