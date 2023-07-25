import { IDefinitionRepository } from "../db/IDefinitionRepository";
import { IWordRepository } from "../db/IWordRepository";
import { IUserRepository } from "../db/IUserRepository";

export async function deleteDefinitionsOwnership(
  ownerTelegramId: string,
  word: string,
  definitionIds: number[],
  defRepo: IDefinitionRepository,
  wordRepo: IWordRepository,
  userRepo: IUserRepository
) {
  const wordId = await wordRepo.addWord(word);
  const user = await userRepo.getOrAdd(ownerTelegramId);

  await wordRepo.addWordOwnership(wordId, user.id);

  await Promise.all(definitionIds
    .map((id) => defRepo.removeOwnershipByIdAndTelegram(id, ownerTelegramId)));
}


