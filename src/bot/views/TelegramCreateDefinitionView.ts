import TelegramBot, { InlineKeyboardButton, InlineKeyboardMarkup, Message } from "node-telegram-bot-api";
import { BotContext } from "../BotContext";
import { BotStateId } from "../states/BotStateId";
import { CANCEL_QUERY_DATA, CONTINUE_QUERY_DATA } from "../states/CreateDefinitionState";
import { ICreateDefinitionView } from "./ICreateDefinitionView";
import { CreateDefinitionStateMeaning } from "../data/CreateDefinitionModel";

export class TelegramCreateDefinitionView implements ICreateDefinitionView {
  loader!: Message | undefined;
  mainView!: Message | undefined;
  private mainViewPromise!: Promise<TelegramBot.Message> | undefined;

  constructor(private context: BotContext<BotStateId, void>) {
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
      const mainView = await this.getMainView(message, reply_markup);
      const message_id = mainView.message_id;
      await Promise.all([
        this.context.editMessageText(message, {
          message_id,
          parse_mode: "Markdown",
          reply_markup
        })
      ]);
    } else {
      this.mainView = await this.getMainView(message, reply_markup);
    }
  }

  private formatMessage(
    meanings: CreateDefinitionStateMeaning[],
    buttonsPerRow = 3
  ): { message: string; reply_markup: InlineKeyboardMarkup } {
    const header = `*List of dictionary definitions available. \nWrite a message(s) to add new definition(s) manually* \n\n`;
    const header0 = `*No definitions found on the internet. Write a message to add new definition*`;
    const messages = meanings.map((m, i) =>
      `${i + 1}) ${m.use ? "✅" : ""} ${m.definition}`);
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
        callback_data: i.toString()
      });
    }

    if (cur.length > 0) buttons.push(cur);


    // add continue button if some of the definitions selected
    if (meanings.some((m) => m.use))
      buttons.push([
        {
          text: "Save",
          callback_data: CONTINUE_QUERY_DATA
        }
      ]);

    // add cancel button
    buttons.push([{
      text: "Cancel",
      callback_data: CANCEL_QUERY_DATA
    }]);

    return { message, reply_markup: { inline_keyboard: buttons } };
  }


  private async getMainView(message: string, reply_markup: InlineKeyboardMarkup): Promise<TelegramBot.Message> {
    if (this.mainView) return Promise.resolve(this.mainView);
    if (this.mainViewPromise) return this.mainViewPromise;
    this.mainViewPromise = this.context.sendMessage(message, {
      reply_markup,
      parse_mode: "Markdown"
    }).then((result) => {
      this.mainViewPromise = undefined;
      return result;
    });
    return this.mainViewPromise;
  }

  async showLoader() {
    this.loader = await this.context.sendMessage("Retrieving definitions...");
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
