import { IUserRepository } from "../db/IUserRepository";
import { IWordRepository } from "../db/IWordRepository";
import { IWord } from "../entities/IWord";
import { SanitizedWordString } from "../utils/sanitize";

export async function addWordWithOwner(
  ownerTelegramId: string,
  word: SanitizedWordString,
  userRepo: IUserRepository,
  wordRepo: IWordRepository
): Promise<IWord> {
  const wordId = await wordRepo.addWord(word);
  const user = await userRepo.getOrAdd(ownerTelegramId);
  await wordRepo.addWordOwnership(wordId, user.id);
  return {
    id: wordId,
    word
  };
}


