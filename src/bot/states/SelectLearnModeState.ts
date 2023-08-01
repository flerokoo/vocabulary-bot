import { AbstractState } from "./AbstractState";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { CANCEL_QUERY_DATA } from "../common/query-data-constants";
import { SelectLearnTagsStatePayload } from "./SelectLearnTagsState";

export type SelectLearnModeStatePayload = void;

const MAIN_TEXT = `Select learn mode`;

const LearnModeStrings = ["Words", "Definitions"] as const;
export type LearnMode = typeof LearnModeStrings[number];

export class SelectLearnModeState extends AbstractState<BotStateId, SelectLearnModeStatePayload, SelectLearnTagsStatePayload> {
  private message!: TelegramBot.Message | undefined;

  constructor(userId: number) {
    super(userId);
  }

  async enter() {

    const inline_keyboard: InlineKeyboardButton[][] = LearnModeStrings.map(text => ([
      { text, callback_data: text }
    ]));

    inline_keyboard.push([{text: "↩️ Cancel", callback_data: CANCEL_QUERY_DATA}])

    this.message = await this.context.sendMessage(MAIN_TEXT, {
      reply_markup: { inline_keyboard }
    });
  }

  async exit() {
    if (!this.message) return;
    await this.context.deleteMessage(this.message!.message_id);
    this.message = undefined;
  }

  async handleMessage() {

  }

  private handleCommand() {

  }

  async handleCallbackQuery(query:TelegramBot.CallbackQuery) {
    if (query.data === CANCEL_QUERY_DATA) {
        return this.context.setState("main");
    }

    if (LearnModeStrings.indexOf(query.data as LearnMode) === -1) return;
    this.context.setState("select-learn-tags", { mode : query.data as LearnMode})
  }
}
