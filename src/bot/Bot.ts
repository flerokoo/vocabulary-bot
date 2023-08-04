import TelegramBot, { CallbackQuery, ChatId, InlineQuery, Message, SendMessageOptions } from "node-telegram-bot-api";
import { BotContext } from "./BotContext";
import { Stream } from "stream";
import { EventEmitter } from "events";
import { AsyncGetter, createAsyncGetter } from "../utils/create-async-getter";

export interface ContextConfigurator {
  (ctx: BotContext, chatId: ChatId): void;
}


export class Bot extends EventEmitter {
  private readonly tg: TelegramBot;
  private readonly contexts: {
    [key: ChatId]: AsyncGetter<BotContext>;
  } = {};
  private readonly contextConfigurator: ContextConfigurator;

  constructor(token: string, contextConfigurator: ContextConfigurator) {
    super();
    this.tg = new TelegramBot(token, { polling: true });
    this.tg.on("message", (msg) => this.onMessage(msg));
    this.tg.on("callback_query", (query) => this.onCallbackQuery(query));
    const reportError = (errorName: string) => (...err: any[]) => this.emit(errorName, ...err);
    this.tg.on("error", reportError("error"));
    this.tg.on("polling_error", reportError("polling_error"));
    this.contextConfigurator = contextConfigurator;
  }

  private onMessage(msg: TelegramBot.Message) {
    this.getContext(msg.chat.id).then((context) => context.onMessage(msg));
  }

  private onCallbackQuery(query: CallbackQuery) {
    this.getContext(query.from.id).then((context) => context.onCallbacKQuery(query));
  }

  private async createContext(chatId: ChatId) {
    this.contexts[chatId] = createAsyncGetter(async () => {
      const context = new BotContext(this, chatId);
      await this.contextConfigurator(context, chatId);
      return context;
    });
  }

  private async getContext(chatId: ChatId) {
    if (!this.contexts[chatId]) await this.createContext(chatId);
    return this.contexts[chatId].getValue();
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

  sendDocument(
    chatId: TelegramBot.ChatId,
    doc: string | Stream | Buffer,
    options?: TelegramBot.SendDocumentOptions,
    fileOptions?: TelegramBot.FileOptions
  ) {
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
