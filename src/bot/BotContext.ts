import { AbstractState } from "./states/AbstractState";
import TelegramBot, { ChatId, SendMessageOptions } from "node-telegram-bot-api";
import { Bot } from "./Bot";
import { Stream } from "stream";

type Constructor<T> = new (...args: any[]) => T;
type StateConstructor = Constructor<AbstractState<any>>
type StatePayload<T extends AbstractState<any>> = T extends AbstractState<infer TPayload>
  ? TPayload
  : never;


export class BotContext {
  private states: Map<StateConstructor, AbstractState<any>> = new Map();
  private currentState!: AbstractState<any>;

  constructor(
    public readonly bot: Bot,
    public readonly chatId: ChatId
  ) {
  }

  addState(state: AbstractState<any>) {
    const constructor = state.constructor as StateConstructor;
    if (this.states.has(constructor))
      throw new Error(`State already exists in this context ` + state.constructor.name);
    this.states.set(constructor, state);
    state.context = this;
  }

  setState<T extends AbstractState<any>>(stateType: Constructor<T>,
                                         payload?: StatePayload<T>) {
    if (this.currentState) {
      this.currentState.exit();
    }
    const state = this.states.get(stateType);
    if (!state) throw new Error(`No state in this context: ` + stateType);
    this.currentState = state;
    state.enter(payload);
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

  sendDocument(
    doc: string | Stream | Buffer,
    options?: TelegramBot.SendDocumentOptions,
    fileOptions?: TelegramBot.FileOptions
  ) {
    return this.bot.sendDocument(this.chatId, doc, options, fileOptions);
  }

  dispose() {
    for (const state of this.states.values()) {
      state.dispose();
    }

  }
}
