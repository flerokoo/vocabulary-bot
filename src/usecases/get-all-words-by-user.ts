import { IWordRepository } from "../db/IWordRepository";

export async function getAllWordsByUser (
  ownerTelegramId: string,
  wordRepo: IWordRepository
) {
  const words = wordRepo.getAllByTelegramId(this.context.chatId.toString());
  return words;
}


