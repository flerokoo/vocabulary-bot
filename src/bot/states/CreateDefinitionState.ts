import { AbstractState } from "./AbstractState";
import TelegramBot, { InlineKeyboardButton, InlineKeyboardMarkup } from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { PayloadUnion } from "../create-bot";
import { ICreateDefinitionPresenter } from "../presenters/ICreateDefinitionPresenter";
import { ICreateDefinitionView } from "../views/ICreateDefinitionView";
import { CreateDefinitionStateMeaning } from "../data/CreateDefinitionModel";
import { AsyncQueue } from "../../utils/AsyncQueue";
import { ILogger } from "../../utils/ILogger";
import {
  CANCEL_QUERY_DATA,
  CONTINUE_QUERY_DATA,
  NEXT_PAGE_QUERY_DATA,
  PREV_PAGE_QUERY_DATA
} from "../common/query-data-constants";
import { groupKeyboardButtons } from "../common/group-keyboard-buttons";
import { AssignTagsState } from "./AssignTagsState";
import { MainState } from "./MainState";
import { IMeaning } from "../../entities/IMeaning";

export type CreateDefinitionStatePayload = {
  readonly word: string;
  readonly isNewWord: boolean;
};

export class CreateDefinitionState
  extends AbstractState<CreateDefinitionStatePayload>
  implements ICreateDefinitionView {
  private mainView!: TelegramBot.Message | undefined;
  private updateQueue: AsyncQueue = new AsyncQueue();

  constructor(
    userId: number,
    private presenter: ICreateDefinitionPresenter,
    private logger: ILogger
  ) {
    super(userId);
  }

  async enter(payload: CreateDefinitionStatePayload) {
    this.presenter.onShow(payload, this.userId);
    this.updateQueue.add(async () => {
      this.mainView = await this.context.sendMessage("Retrieving definitions...");
    });
  }

  exit() {
    this.presenter.reset();
  }

  async handleMessage(message: TelegramBot.Message) {
    if (!message.text) return;
    if (message.text.length === 0) return;
    this.presenter.addDefinition(message.text);
  }

  async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    const answer = (text: string) => this.context.answerCallbackQuery(query.id, { text, callback_query_id: query.id });

    if (query.data === CONTINUE_QUERY_DATA) {
      const [success, wordId] = await this.presenter.onContinue();
      await answer(success ? "Moving on..." : "Some error occurred while saving");
      if (success) this.context.setState(AssignTagsState, { wordId });
      else this.context.setState(MainState);
      return;
    }

    if (query.data === CANCEL_QUERY_DATA) {
      await answer("Cancelled");
      this.context.setState(MainState);
      return;
    }

    if (query.data === NEXT_PAGE_QUERY_DATA) {
      await answer("Next page");
      this.presenter.onNextPageRequested();
      return;
    }

    if (query.data === PREV_PAGE_QUERY_DATA) {
      await answer("Prev page");
      this.presenter.onPrevPageRequested();
      return;
    }

    this.presenter.toggleDefinitionUsage(query.data);
    await answer("Toggled");
  }

  async showDefinitions(meanings: CreateDefinitionStateMeaning[], currentPage: number, totalPages: number, defsPerPage: number): Promise<void> {
    const { message, reply_markup } = this.formatMessage(meanings, currentPage, totalPages, defsPerPage);
    this.updateQueue.add(async () => {
      await this.context.editMessageText(message, {
        message_id: this.mainView!.message_id,
        parse_mode: "Markdown",
        reply_markup
      });
    });
  }

  private formatMessage(
    meanings: CreateDefinitionStateMeaning[],
    currentPage: number,
    totalPages: number,
    defsPerPage: number): { message: string; reply_markup: TelegramBot.InlineKeyboardMarkup } {
    const header = `*Here's a list of available definitions. \nWrite a message(s) to add new definition(s) manually* \n\n`;
    const header0 = `*No definitions found on the internet. Write a message to add new definition*`;
    const pageMeanings = meanings.slice(currentPage * defsPerPage, (currentPage + 1) * defsPerPage);
    const indexOffset = currentPage * defsPerPage;
    const messages = pageMeanings.map((m, i) =>
      `${i + indexOffset + 1}) ${m.selected ? "✅" : ""} ${m.definition}`);
    const message = (meanings.length > 0 ? header : header0) + messages.join("\n\n");
    const buttons: InlineKeyboardButton[] = [];
    for (let i = 0; i < pageMeanings.length; i++) {
      buttons.push({
        text: `${pageMeanings[i].selected ? "✅" : "❌"} ${i + indexOffset + 1}`,
        callback_data: (i + indexOffset).toString()
      });
    }

    const buttonsPerRow = 3;
    const inline_keyboard = groupKeyboardButtons(buttons, buttonsPerRow);

    if (totalPages > 1) {
      const pageButtons : InlineKeyboardButton[] = [];
      if (currentPage > 0)
        pageButtons.push({ text: "Prev page", callback_data: PREV_PAGE_QUERY_DATA});
      if (currentPage < totalPages - 1)
        pageButtons.push({ text: "Next page", callback_data: NEXT_PAGE_QUERY_DATA});
      inline_keyboard.push(pageButtons);
    }


    // add continue button if some of the definitions selected
    if (meanings.some((m) => m.selected))
      inline_keyboard.push([{ text: "➡️ Continue", callback_data: CONTINUE_QUERY_DATA }]);

    // add cancel button
    inline_keyboard.push([{ text: "↩️ Cancel", callback_data: CANCEL_QUERY_DATA }]);

    return { message, reply_markup: { inline_keyboard } };
  }

  async cleanup() {
    this.updateQueue.clear();
    this.updateQueue.add(async () => {
      if (!this.mainView) return;
      await this.context.deleteMessage(this.mainView.message_id);
      this.mainView = undefined;
    });
  }
}
