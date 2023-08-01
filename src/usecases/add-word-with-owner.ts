import { IUserRepository } from "../db/IUserRepository";
import { IWordRepository } from "../db/IWordRepository";
import { IWord } from "../entities/IWord";
import { SanitizedWordString } from "../utils/sanitize";

export async function addWordWithOwner(
  userId: number,
  word: SanitizedWordString,
  userRepo: IUserRepository,
  wordRepo: IWordRepository,
): Promise<IWord> {
  const wordId = await wordRepo.addWord(word);
  await wordRepo.addWordOwnership(wordId, userId);
  return {
    id: wordId,
    word,
  };
}
