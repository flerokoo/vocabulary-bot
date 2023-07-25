import { IDefinitionRepository } from "../db/IDefinitionRepository";
import { IWordRepository } from "../db/IWordRepository";
import { IUserRepository } from "../db/IUserRepository";
import { IMeaning } from "../entities/IMeaning";
import { IWord } from "../entities/IWord";

export async function deleteDefinitionsOwnership(
  ownerTelegramId: string,
  word: IWord,
  definitionIds: IMeaning[],
  defRepo: IDefinitionRepository,
  wordRepo: IWordRepository,
  userRepo: IUserRepository
) {
  const wordId = await wordRepo.addWord(word.word);
  const user = await userRepo.getOrAdd(ownerTelegramId);

  await wordRepo.addWordOwnership(wordId, user.id);

  await Promise.all(definitionIds
    .map((m) => defRepo.removeOwnershipByIdAndTelegram(m.id as number, ownerTelegramId)));
}


