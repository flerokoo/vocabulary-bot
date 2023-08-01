import { ChatId } from "node-telegram-bot-api";

export interface IAssignStatePresenter {
  onAddNewTag(text: string): void;

  onShow(userId: number, chatId: ChatId, wordId: number): Promise<void>;

  onToggleTagUsage(tag: string): Promise<void>;

  onSaveRequest(): Promise<boolean>;
}