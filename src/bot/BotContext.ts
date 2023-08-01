import { AbstractState } from "./states/AbstractState";
import TelegramBot, { ChatId, SendMessageOptions } from "node-telegram-bot-api";
import { Bot } from "./Bot";
import { Stream } from "stream";

export class BotContext<TStateKey extends string, TPayload> {
  private states: { [key: string]: AbstractState<TStateKey, any, any> } = {};
  private currentState!: AbstractState<TStateKey, any, any>;

  constructor(
    public readonly bot: Bot<TStateKey, TPayload>,
    public readonly chatId: ChatId
  ) {
  }

  addState(id: TStateKey, state: AbstractState<TStateKey, TPayload, TPayload>) {
    if (id in this.states) throw new Error(`State ${id} exists`);
    this.states[id] = state;
    state.context = this;
  }

  setState(id: TStateKey, payload?: TPayload) {
    if (this.currentState) {
      this.currentState.exit();
    }

    this.currentState = this.states[id];
    this.currentState.enter(payload);
  }

  onMessage(msg: TelegramBot.Message) {
    if (!this.currentState) return;
    this.currentState.handleMessage(msg);
  }

  sendMessage(message: string, options?: SendMessageOptions) {
    return this.bot.sendMessage(this.chatId, message, options);
  }

  deleteMessage(messageId: number, options?: any) {
    return this.bot.deleteMessage(this.chatId, messageId, options);
  }

  onCallbacKQuery(query: TelegramBot.CallbackQuery) {
    if (!this.currentState) return;
    this.currentState.handleCallbackQuery(query);
  }

  editMessageText(text: string, options?: TelegramBot.EditMessageTextOptions) {
    return this.bot.editMessageText(text, {
      ...options,
      chat_id: this.chatId
    });
  }

  editMessageReplyMarkup(
    replyMarkup: TelegramBot.InlineKeyboardMarkup,
    options?: TelegramBot.EditMessageReplyMarkupOptions
  ) {
    return this.bot.editMessageReplyMarkup(replyMarkup, {
      ...options,
      chat_id: this.chatId
    });
  }

  answerCallbackQuery(queryId: string, options?: TelegramBot.AnswerCallbackQueryOptions) {
    return this.bot.answerCallbackQuery(queryId, options);
  }

  sendDocument(doc: string | Stream | Buffer,
               options?: TelegramBot.SendDocumentOptions,
               fileOptions?: TelegramBot.FileOptions) {
    return this.bot.sendDocument(this.chatId, doc, options, fileOptions);
  }

  dispose() {
    for (const key of Object.keys(this.states)) {
      this.states[key].dispose();
    }
  }
}
