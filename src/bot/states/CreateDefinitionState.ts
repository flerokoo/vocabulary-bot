import { AbstractState } from "./AbstractState";
import TelegramBot, { InlineKeyboardButton, InlineKeyboardMarkup } from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { PayloadUnion } from "../create-bot";
import { ICreateDefinitionPresenter } from "../presenters/ICreateDefinitionPresenter";
import { ICreateDefinitionView } from "../views/ICreateDefinitionView";
import { CreateDefinitionStateMeaning } from "../data/CreateDefinitionModel";

export const CONTINUE_QUERY_DATA = "continue";
export const CANCEL_QUERY_DATA = "cancel";

export type CreateDefinitionStatePayload = {
  readonly word: string;
  readonly isNewWord: boolean;
};

export class CreateDefinitionState
  extends AbstractState<BotStateId, CreateDefinitionStatePayload, PayloadUnion>
  implements ICreateDefinitionView
{
  private loader!: TelegramBot.Message | undefined;
  private mainViewPromise!: Promise<TelegramBot.Message> | undefined;
  private mainView!: TelegramBot.Message | undefined;

  constructor(private presenter: ICreateDefinitionPresenter) {
    super();
  }

  async enter(payload: CreateDefinitionStatePayload) {
    this.presenter.onShow(payload, this.context.chatId.toString());
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
    const answer = (text: string) => this.context.answerCallbackQuery(
      query.id, { text, callback_query_id: query.id });

    if (query.data === CONTINUE_QUERY_DATA) {
      await this.presenter.onContinue();
      await answer("Saved successfully");
      this.context.setState("main");
      return;
    }

    if (query.data === CANCEL_QUERY_DATA) {
      await answer("Cancelled");
      this.context.setState("main");
      return;
    }

    this.presenter.toggleDefinitionUsage(query.data);
    await answer("Toggled");
  }

  async showLoader() {
    this.loader = await this.context.sendMessage("Retrieving definitions...");
  }

  async hideLoader() {
    if (!this.loader) return;
    try {
      const loader = this.loader;
      this.loader = undefined;
      await this.context.deleteMessage(loader.message_id);
    } catch (e) {
      console.error("Loader hide failed");
    }
  }

  async showDefinitions(meanings: CreateDefinitionStateMeaning[]) {
    const { message, reply_markup } = this.formatMessage(meanings);

    if (this.mainView) {
      const mainView = await this.getOrCreateMainView(message, reply_markup);
      const message_id = mainView.message_id;
      await Promise.all([
        this.context.editMessageText(message, {
          message_id,
          parse_mode: "Markdown",
          reply_markup,
        }),
      ]);
    } else {
      await this.getOrCreateMainView(message, reply_markup);
    }
  }

  private formatMessage(
    meanings: CreateDefinitionStateMeaning[],
    buttonsPerRow = 3,
  ): { message: string; reply_markup: InlineKeyboardMarkup } {
    const header = `*Here's a list of available definitions. \nWrite a message(s) to add new definition(s) manually* \n\n`;
    const header0 = `*No definitions found on the internet. Write a message to add new definition*`;
    const messages = meanings.map((m, i) => `${i + 1}) ${m.use ? "✅" : ""} ${m.definition}`);
    const message = (meanings.length > 0 ? header : header0) + messages.join("\n\n");
    const buttons: InlineKeyboardButton[][] = [];
    let cur: InlineKeyboardButton[] = [];
    for (let i = 0; i < meanings.length; i++) {
      if (cur.length == buttonsPerRow) {
        buttons.push(cur);
        cur = [];
      }
      cur.push({
        text: `${meanings[i].use ? "✅" : "❌"} ${i + 1}`,
        callback_data: i.toString(),
      });
    }

    if (cur.length > 0) buttons.push(cur);

    // add continue button if some of the definitions selected
    if (meanings.some((m) => m.use))
      buttons.push([
        {
          text: "Save",
          callback_data: CONTINUE_QUERY_DATA,
        },
      ]);

    // add cancel button
    buttons.push([
      {
        text: "Cancel",
        callback_data: CANCEL_QUERY_DATA,
      },
    ]);

    return { message, reply_markup: { inline_keyboard: buttons } };
  }

  private async getOrCreateMainView(message: string, reply_markup: InlineKeyboardMarkup): Promise<TelegramBot.Message> {
    if (this.mainView) return Promise.resolve(this.mainView);
    if (this.mainViewPromise) return this.mainViewPromise;
    this.mainViewPromise = this.context
      .sendMessage(message, {
        reply_markup,
        parse_mode: "Markdown",
      })
      .then((result) => {
        this.mainView = result;
        this.mainViewPromise = undefined;
        return result;
      });
    return this.mainViewPromise;
  }

  async cleanup() {
    const promises = [];
    promises.push(this.hideLoader());

    if (this.mainView) {
      const mainView = this.mainView;
      this.mainView = undefined;
      promises.push(this.context.deleteMessage(mainView.message_id));
    }

    try {
      await Promise.all(promises);
    } catch (e: any) {
      console.error("Main view hide error");
    }
  }
}
