import { IWordRepository } from "../db/IWordRepository";
import { IDefinitionRepository } from "../db/IDefinitionRepository";
import { IUserRepository } from "../db/IUserRepository";
import { IMeaning } from "../entities/IMeaning";
import { IWord } from "../entities/IWord";

export async function addDefinitionsWithOwner(
  ownerTelegramId: string,
  word: IWord,
  definitions: IMeaning[],
  defRepo: IDefinitionRepository,
  wordRepo: IWordRepository,
  userRepo: IUserRepository
) {
  const wordId = await wordRepo.addWord(word.word);
  const user = await userRepo.getOrAdd(ownerTelegramId);

  await wordRepo.addWordOwnership(wordId, user.id);

  const definitionIds = await Promise.all(definitions
    .map(m => defRepo.add(wordId, m.definition)));

  await Promise.all(definitionIds.map(id =>
    defRepo.addOwnership(id, user.id)));

  return definitionIds;
}


