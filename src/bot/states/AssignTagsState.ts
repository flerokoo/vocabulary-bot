import { AbstractState } from "./AbstractState";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { BotDependencies } from "../create-bot";
import { MainStatePayload } from "./MainState";
import { AsyncQueue } from "../../utils/AsyncQueue";
import { CANCEL_QUERY_DATA, CONTINUE_QUERY_DATA } from "../common/query-data-constants";
import { groupKeyboardButtons } from "../common/group-keyboard-buttons";
import { IAssignStatePresenter } from "../presenters/IAssignStatePresenter";
import { IAssignStateView } from "../views/IAssignStateView";
import { AssignTagsStateModelData } from "../data/AssignTagsStateModel";

export type AssignTagsStatePayload = { wordId: number };

export class AssignTagsState
  extends AbstractState<BotStateId, AssignTagsStatePayload, MainStatePayload>
  implements IAssignStateView
{
  private updateQueue = new AsyncQueue();
  private mainView!: TelegramBot.Message | undefined;

  constructor(
    userId: number,
    private presenter: IAssignStatePresenter,
    private deps: BotDependencies,
  ) {
    super(userId);
  }

  async enter(payload: AssignTagsStatePayload) {
    this.updateQueue.add(async () => {
      this.mainView = await this.context.sendMessage("Loading...");
    });
    this.presenter.onShow(this.userId, this.chatId, payload.wordId);
  }

  exit() {
    this.updateQueue.clear();
    this.updateQueue.add(async () => {
      if (!this.mainView) return;
      await this.context.deleteMessage(this.mainView.message_id);
      this.mainView = undefined;
    });
  }

  async handleMessage(message: TelegramBot.Message) {
    if (message.text && message.text.length > 0) {
      this.presenter.onAddNewTag(message.text as string);
    }
  }

  private handleCommand() {}

  async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    const answer = (text: string) => this.context.answerCallbackQuery(query.id, { text, callback_query_id: query.id });

    if (query.data === CANCEL_QUERY_DATA) {
      await answer("Cancelling...");
      return this.context.setState("main");
    }

    if (query.data === CONTINUE_QUERY_DATA) {
      await answer("Moving on...");
      this.presenter.onSaveRequest();
      return this.context.setState("main");
    }

    await this.presenter.onToggleTagUsage(query.data as string);
  }

  updateView(data: AssignTagsStateModelData): void {
    const buttons: InlineKeyboardButton[] = [];
    for (const { tag, selected } of data.tags) {
      buttons.push({ text: `${selected ? "✅" : "❌"} ${tag.tag}`, callback_data: tag.tag });
    }
    const inline_keyboard = groupKeyboardButtons(buttons);
    if (data.tags.some((_) => _.selected)) inline_keyboard.push([{ text: "Save", callback_data: CONTINUE_QUERY_DATA }]);
    inline_keyboard.push([{ text: "Cancel", callback_data: CANCEL_QUERY_DATA }]);

    this.updateQueue.add(async () => {
      await this.context.editMessageText("Select tags for this word or add new ones by sending a message", {
        message_id: this.mainView!.message_id,
        reply_markup: { inline_keyboard },
      });
    });
  }
}
