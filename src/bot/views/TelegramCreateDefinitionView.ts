import { InlineKeyboardButton, InlineKeyboardMarkup, Message } from "node-telegram-bot-api";
import { BotContext } from "../BotContext";
import { BotStateId } from "../states/BotStateId";
import { CANCEL_QUERY_DATA, CONTINUE_QUERY_DATA } from "../states/CreateDefinitionState";
import { ICreateDefinitionView } from "./ICreateDefinitionView";
import { CreateDefinitionStateMeaning } from "../data/CreateDefinitionModel";

export class TelegramCreateDefinitionView implements ICreateDefinitionView {
  loader!: Message | undefined;
  mainView!: Message | undefined;

  constructor(private context: BotContext<BotStateId, void>) {
  }

  async hideLoader() {
    if (!this.loader) return;
    try {
      await this.context.deleteMessage(this.loader.message_id);
    } catch (e) {
      // console.error(e)
    }
    this.loader = undefined;
  }

  async showDefinitions(meanings: CreateDefinitionStateMeaning[]) {
    const { message, reply_markup } = this.formatMessage(meanings);

    if (this.mainView) {
      const message_id = this.mainView.message_id;
      await Promise.all([
        this.context.editMessageText(message, {
          message_id,
          parse_mode: "Markdown",
          reply_markup
        })
      ]);
    } else {
      this.mainView = await this.context.sendMessage(message, {
        reply_markup,
        parse_mode: "Markdown"
      });
    }
  }

  private formatMessage(
    meanings: CreateDefinitionStateMeaning[],
    buttonsPerRow = 3
  ): { message: string; reply_markup: InlineKeyboardMarkup } {
    const header = `*List of dictionary definitions available. \nWrite a message(s) to add new definition(s) manually* \n\n`;
    const header0 = `*No definitions found on the internet. Write a message to add new definition*`;
    const messages = meanings.map((m, i) =>
      `${i + 1}) ${m.use ? "✓" : ""} ${m.definition}`);
    const message = (messages.length > 0 ? header : header0) + messages.join("\n\n");
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
    }])

    return { message, reply_markup: { inline_keyboard: buttons } };
  }

  async showLoader() {
    this.loader = await this.context.sendMessage("Retrieving definitions...");
  }

  async cleanup() {
    await this.hideLoader();
    if (this.mainView) {
      try {
        await this.context.deleteMessage(this.mainView.message_id);
      } catch (e: any) {
        // console.error(e);
      }
      this.mainView = undefined;
    }
  }
}
