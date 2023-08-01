import { AbstractState } from "./AbstractState";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { CANCEL_QUERY_DATA, CONTINUE_QUERY_DATA } from "../common/query-data-constants";
import { ITagRepository } from "../../db/ITagRepository";
import { groupKeyboardButtons } from "../common/group-keyboard-buttons";
import { ITag } from "../../entities/ITag";
import { AsyncQueue } from "../../utils/AsyncQueue";
import { SelectLearnTagsStatePayload } from "./SelectLearnTagsState";

export type PayloadConverter<TInput, TOutput> = (input: TInput, tags: ITag[]) => TOutput;

export class SelectTagsState<TIncomingPayload, TOutgoingPayload>
  extends AbstractState<BotStateId, TIncomingPayload, TOutgoingPayload> {
  private message!: TelegramBot.Message | undefined;
  private usedTags: ITag[] = [];
  private tags!: ITag[];
  private updateQueue: AsyncQueue = new AsyncQueue();
  private lastPayload!: TIncomingPayload | undefined;

  constructor(userId: number,
              private mainText: string,
              private tagRepo: ITagRepository,
              private nextState: BotStateId,
              private payloadConverter: PayloadConverter<TIncomingPayload, TOutgoingPayload>) {
    super(userId);
  }

  async enter(payload: TIncomingPayload) {
    this.lastPayload = payload;
    this.usedTags = [];
    this.tags = await this.tagRepo.getAllTagsByUserId(this.userId);
    this.updateQueue.add(async () => {
      this.message = await this.context.sendMessage("Loading tags...");
      await this.showSelector();
    });
  }

  private async showSelector() {
    const isUsed = (tag: string) => this.usedTags.some(o => o.tag === tag);
    const inline_keyboard: InlineKeyboardButton[][] = groupKeyboardButtons(this.tags.map(({ tag }) => ({
      text: `${isUsed(tag) ? "✅" : "❌"} ${tag}`,
      callback_data: tag
    })));

    if (this.usedTags.length > 0)
      inline_keyboard.push([{ text: "➡️ Continue", callback_data: CONTINUE_QUERY_DATA }]);
    inline_keyboard.push([{ text: "↩️ Cancel", callback_data: CANCEL_QUERY_DATA }]);

    this.updateQueue.add(async () => {
      await this.context.editMessageText(this.mainText, {
        message_id: this.message!.message_id,
        reply_markup: { inline_keyboard }
      });
    });
  }

  exit() {
    this.lastPayload = undefined;
    this.updateQueue.clear();
    this.updateQueue.add(async () => {
      if (!this.message) return;
      await this.context.deleteMessage(this.message.message_id);
      this.message = undefined;
    });
  }

  async handleMessage() {

  }

  private handleCommand() {

  }

  async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    if (query.data === CANCEL_QUERY_DATA) {
      return this.context.setState("main");
    }

    if (query.data === CONTINUE_QUERY_DATA) {
      return this.context.setState(this.nextState,
        this.payloadConverter(this.lastPayload as TIncomingPayload, this.usedTags));
    }


    if (!this.tags.some(({ tag }) => tag === query.data)) return; // no such tag

    const isSelected = this.usedTags.some(({ tag }) => tag === query.data);
    if (isSelected)
      this.usedTags = this.usedTags.filter(({ tag }) => tag === query.data);
    else
      this.usedTags.push(this.tags.find(({ tag }) => tag === query.data) as ITag);

    await this.showSelector();
  }
}


