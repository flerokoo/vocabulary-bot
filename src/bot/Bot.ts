import TelegramBot, { CallbackQuery, ChatId, InlineQuery, Message, SendMessageOptions } from "node-telegram-bot-api";
import { BotContext } from "./BotContext";
import { Stream } from "stream";
import { EventEmitter } from "events";

export interface ContextConfigurator<T extends string, K> {
  (ctx: BotContext<T, K>): void;
}

export class Bot<TStateKey extends string, TPayload> extends EventEmitter {
  private readonly tg: TelegramBot;
  private readonly contexts: {
    [key: ChatId]: BotContext<TStateKey, TPayload>;
  } = {};
  private readonly contextConfigurator: ContextConfigurator<TStateKey, TPayload>;

  constructor(token: string, contextConfigurator: ContextConfigurator<TStateKey, TPayload>) {
    super();
    this.tg = new TelegramBot(token, { polling: true });
    this.tg.on("message", (msg) => this.onMessage(msg));
    this.tg.on("callback_query", (query) => this.onCallbackQuery(query));
    const reportError = (err : any) => this.emit(err);
    this.tg.on("error", reportError);
    this.tg.on("polling_error", reportError);
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

  sendMessage(chatId: ChatId, message: string, options?: SendMessageOptions): Promise<TelegramBot.Message> {
    return this.safeCall(() => this.tg.sendMessage(chatId, message, options));
  }

  deleteMessage(chatId: ChatId, messageId: number, options?: any) {
    return this.safeCall(() => this.tg.deleteMessage(chatId, messageId, options));
  }

  editMessageText(text: string, options?: TelegramBot.EditMessageTextOptions) {
    return this.safeCall(() => this.tg.editMessageText(text, options));
  }

  editMessageReplyMarkup(
    replyMarkup: TelegramBot.InlineKeyboardMarkup,
    options?: TelegramBot.EditMessageReplyMarkupOptions
  ) {
    return this.safeCall(() => this.tg.editMessageReplyMarkup(replyMarkup, options));
  }

  answerCallbackQuery(queryId: string, options?: TelegramBot.AnswerCallbackQueryOptions) {
    return this.safeCall(() => this.tg.answerCallbackQuery(queryId, options));
  }

  sendDocument(chatId: TelegramBot.ChatId,
               doc: string | Stream | Buffer,
               options?: TelegramBot.SendDocumentOptions,
               fileOptions?: TelegramBot.FileOptions) {
    return this.safeCall(() => this.tg.sendDocument(chatId, doc, options, fileOptions));
  }

  async stop() {
    await this.tg.stopPolling();
  }

  private async safeCall<T>(fn: () => Promise<T>): Promise<T> {
    let out = null;
    try {
      out = await fn();
    } catch (error) {
      this.emit("error", error);
    }
    return out as T;
  }
}
