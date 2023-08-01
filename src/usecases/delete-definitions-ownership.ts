import { IDefinitionRepository } from "../db/IDefinitionRepository";
import { IWordRepository } from "../db/IWordRepository";
import { IMeaning } from "../entities/IMeaning";
import { IWord } from "../entities/IWord";

export async function deleteDefinitionsOwnership(
  userId: number,
  word: IWord,
  definitionIds: IMeaning[],
  defRepo: IDefinitionRepository,
  wordRepo: IWordRepository,
) {
  const wordId = await wordRepo.addWord(word.word);
  await wordRepo.addWordOwnership(wordId, userId);

  await Promise.all(definitionIds.map((m) => defRepo.removeOwnershipByIdAndUserId(m.id as number, userId)));
}
