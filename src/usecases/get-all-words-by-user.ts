import { IWordRepository } from "../db/IWordRepository";

export async function getAllWordsByUser(userId: number, wordRepo: IWordRepository) {
  const words = wordRepo.getAllByUserId(userId);
  return words;
}
