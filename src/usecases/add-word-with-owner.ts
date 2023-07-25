import { IUserRepository } from "../db/IUserRepository";
import { IWordRepository } from "../db/IWordRepository";

export async function addWordWithOwner(
  ownerTelegramId: string,
  word: string,
  userRepo: IUserRepository,
  wordRepo: IWordRepository
) {
  const wordId = await wordRepo.addWord(word);
  const user = await userRepo.getOrAdd(ownerTelegramId);
  await wordRepo.addWordOwnership(wordId, user.id);
}


