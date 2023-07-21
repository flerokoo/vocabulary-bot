import TelegramBot from "node-telegram-bot-api";
import { BotContext } from "../BotContext";

export abstract class AbstractState<
  TStateKey extends string,
  TIncomingPayload,
  TOutgoingPayload,
> {
  context!: BotContext<TStateKey, TOutgoingPayload>;

  protected constructor() {}

  abstract enter(payload: TIncomingPayload): void;

  abstract handleMessage(message: TelegramBot.Message): void;

  abstract handleCallbackQuery(query: TelegramBot.CallbackQuery): void;

  abstract exit(): void;
}
