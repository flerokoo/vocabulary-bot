import TelegramBot from "node-telegram-bot-api";
import { BotContext } from "../BotContext";

export abstract class AbstractState<TPayload> {
  context!: BotContext;

  protected constructor(protected readonly userId: number) {}

  abstract enter(payload: TPayload): void;

  abstract handleMessage(message: TelegramBot.Message): void;

  abstract handleCallbackQuery(query: TelegramBot.CallbackQuery): void;

  abstract exit(): void;

  get chatId() {
    return this.context.chatId.toString();
  }

  dispose() {}
}
