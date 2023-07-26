import { IWordRepository } from "../db/IWordRepository";
import { IWord } from "../entities/IWord";

export async function deleteWordOwnership(
  ownerTelegramId: string,
  { word }: IWord,
  wordRepo: IWordRepository
) {
  await wordRepo.removeOwnershipByWordAndTelegram(word, ownerTelegramId);
}


