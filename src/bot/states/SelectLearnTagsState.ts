import { AbstractState } from "./AbstractState";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { LearnStatePayload } from "./LearnState";
import { CANCEL_QUERY_DATA, CONTINUE_QUERY_DATA } from "../common/query-data-constants";
import { ITagRepository } from "../../db/ITagRepository";
import { groupKeyboardButtons } from "../common/group-keyboard-buttons";
import { ITag } from "../../entities/ITag";
import { LearnMode } from "./SelectLearnModeState";
import { AsyncQueue } from "../../utils/AsyncQueue";

export type SelectLearnTagsStatePayload = { mode: LearnMode };

const MAIN_TEXT = `
Select learn tags
`;


export class SelectLearnTagsState extends AbstractState<BotStateId, SelectLearnTagsStatePayload, LearnStatePayload> {
  private message!: TelegramBot.Message;
  private usedTags: ITag[] = [];
  private tags!: ITag[];
  private mode!: LearnMode;
  private updateQueue: AsyncQueue = new AsyncQueue();

  constructor(userId: number, private tagRepo: ITagRepository) {
    super(userId);
  }

  async enter(payload: SelectLearnTagsStatePayload) {
    this.mode = payload.mode;
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
      await this.context.editMessageText(MAIN_TEXT, {
        message_id: this.message.message_id,
        reply_markup: { inline_keyboard }
      });
    });
  }

  exit() {
    this.updateQueue.clear();
    this.updateQueue.add(async () => {
      if (!this.message) return;
      await this.context.deleteMessage(this.message.message_id);
    });
  }

  async handleMessage() {

  }

  private handleCommand() {

  }

  async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    const cleanup = async () => await this.context.deleteMessage(this.message.message_id);

    if (query.data === CANCEL_QUERY_DATA) {
      await cleanup();
      return this.context.setState("main");
    }

    if (query.data === CONTINUE_QUERY_DATA) {
      await cleanup();
      return this.context.setState("learn", { mode: this.mode, tags: this.usedTags });
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
