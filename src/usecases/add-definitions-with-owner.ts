import { IWordRepository } from "../db/IWordRepository";
import { IDefinitionRepository } from "../db/IDefinitionRepository";
import { IUserRepository } from "../db/IUserRepository";

export async function addDefinitionsWithOwner(
  ownerTelegramId: string,
  word: string,
  definitions: string[],
  defRepo: IDefinitionRepository,
  wordRepo: IWordRepository,
  userRepo: IUserRepository
) {
  const wordId = await wordRepo.addWord(word);
  const user = await userRepo.getOrAdd(ownerTelegramId);

  await wordRepo.addWordOwnership(wordId, user.id);

  const definitionIds = await Promise.all(definitions
    .map(definition => defRepo.add(wordId, definition)));

  await Promise.all(definitionIds.map(id =>
    defRepo.addOwnership(id, user.id)));

  return definitionIds;
}


