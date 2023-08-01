import { ITagRepository } from "../db/ITagRepository";
import { ITag } from "../entities/ITag";

export async function updateWordTags(
  userId: number,
  wordId: number,
  usedTags: ITag[],
  unusedTags: ITag[],
  tagRepo: ITagRepository,
) {
  const deletes = unusedTags.map((tag) => tagRepo.unassignTag(userId, tag.id, wordId));
  const additions = usedTags.map((tag) => tagRepo.assignTag(userId, tag.id, wordId));
  await Promise.all([...deletes, ...additions]);
}
