import TelegramBot, { CallbackQuery, ChatId, InlineQuery, SendMessageOptions } from "node-telegram-bot-api";
import { BotContext } from "./BotContext";

export interface ContextConfigurator<T extends string, K> {
  (ctx: BotContext<T, K>): void;
}

export class Bot<TStateKey extends string, TPayload> {
  private readonly tg: TelegramBot;
  private readonly contexts: {
    [key: ChatId]: BotContext<TStateKey, TPayload>;
  } = {};
  private readonly contextConfigurator: ContextConfigurator<TStateKey, TPayload>;

  constructor(token: string, contextConfigurator: ContextConfigurator<TStateKey, TPayload>) {
    this.tg = new TelegramBot(token, { polling: true });
    this.tg.on("message", (msg) => this.onMessage(msg));
    this.tg.on("callback_query", (query) => this.onCallbackQuery(query));
    this.contextConfigurator = contextConfigurator;
  }

  private onMessage(msg: TelegramBot.Message) {
    this.getContext(msg.chat.id).onMessage(msg);
  }

  private onCallbackQuery(query: CallbackQuery) {
    this.getContext(query.from.id).onCallbacKQuery(query);
  }

  private createContext(chatId: ChatId) {
    const context = new BotContext<TStateKey, TPayload>(this, chatId);
    this.contextConfigurator(context);
    this.contexts[chatId] = context;
  }

  private getContext(chatId: ChatId) {
    if (!this.contexts[chatId]) this.createContext(chatId);
    return this.contexts[chatId];
  }

  sendMessage(chatId: ChatId, message: string, options?: SendMessageOptions) {
    return this.tg.sendMessage(chatId, message, options);
  }

  deleteMessage(chatId: ChatId, messageId: number, options?: any) {
    return this.tg.deleteMessage(chatId, messageId, options);
  }

  editMessageText(text: string, options?: TelegramBot.EditMessageTextOptions) {
    return this.tg.editMessageText(text, options);
  }

  editMessageReplyMarkup(
    replyMarkup: TelegramBot.InlineKeyboardMarkup,
    options?: TelegramBot.EditMessageReplyMarkupOptions
  ) {
    return this.tg.editMessageReplyMarkup(replyMarkup, options);
  }

  answerCallbackQuery(queryId: string,  options?: TelegramBot.AnswerCallbackQueryOptions) {
    return this.tg.answerCallbackQuery(queryId, options)
  }
}
