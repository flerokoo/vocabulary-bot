import { IWordRepository } from "../db/IWordRepository";
import { IWord } from "../entities/IWord";

export async function deleteWordOwnership(userId: number, { word }: IWord, wordRepo: IWordRepository) {
  await wordRepo.removeOwnershipByWordAndUserId(word, userId);
}
