import { IWordRepository } from "../db/IWordRepository";
import { IDefinitionRepository } from "../db/IDefinitionRepository";
import { IMeaning } from "../entities/IMeaning";
import { IWord } from "../entities/IWord";

export async function addDefinitionsWithOwner(
  userId: number,
  word: IWord,
  definitions: IMeaning[],
  defRepo: IDefinitionRepository,
  wordRepo: IWordRepository,
) {
  const wordId = await wordRepo.addWord(word.word);

  await wordRepo.addWordOwnership(wordId, userId);

  const definitionIds = await Promise.all(definitions.map((m) => defRepo.add(wordId, m.definition)));

  await Promise.all(definitionIds.map((id) => defRepo.addOwnership(id, userId)));

  return definitionIds;
}
