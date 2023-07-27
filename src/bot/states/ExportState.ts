import { AbstractState } from "./AbstractState";
import { BotStateId } from "./BotStateId";
import { MainStatePayload } from "./MainState";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { IDataExporter } from "../../export/IDataExporter";
import { BotDependencies } from "../create-bot";
import { exportAnkiDeck } from "../../export/export-anki-deck";
import { exportJson } from "../../export/export-json";

export type ExportStatePayload = void;

const CANCEL_QUERY_DATA = "cancel";

export class ExportState extends AbstractState<BotStateId, ExportStatePayload, MainStatePayload> {

  exporters: { [key: string]: IDataExporter } = {
    "Anki Deck": exportAnkiDeck,
    "JSON": exportJson
  };

  private mainView: TelegramBot.Message | undefined;

  constructor(private deps: BotDependencies) {
    super();
  }

  async enter() {
    const inline_keyboard: InlineKeyboardButton[][] = [
      ...Object.keys(this.exporters).map(text => ([{ text, callback_data: text }]))
    ];
    inline_keyboard.push([{ text: "Cancel", callback_data: CANCEL_QUERY_DATA }]);

    this.mainView = await this.context.sendMessage("Select export format",
      { reply_markup: { inline_keyboard } });
  }

  async exit() {
    if (this.mainView) {
      const mainView = this.mainView;
      await this.context.deleteMessage(mainView.message_id);
      this.mainView = undefined;
    }
  }

  async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    const answer = (text: string) => this.context.answerCallbackQuery(
      query.id, { text, callback_query_id: query.id });

    const bail = async (text: string) => {
      await answer(text);
      this.context.setState("main");
    };

    if (query.data === CANCEL_QUERY_DATA || query.data === undefined) {
      await bail("Returning to main page");
      return;
    }

    const exporter = this.exporters[query.data];

    if (!exporter) return;
    const data = await this.getData();
    if (data.length === 0) {
      await bail("No words to export");
    }

    const { filename, data: dataToExport } = await exporter(data);

    await this.context.sendDocument(
      dataToExport,
      {},
      { filename, contentType: "application/octet-stream" });
    await bail("Exported successfully");
  }

  handleMessage(): void {
  }

  async getData() {
    const userId = this.context.chatId.toString();
    const words = await this.deps.wordRepo.getAllByTelegramId(userId);
    const output: { word: string, meanings: string[] }[] = [];

    const promises = [];
    for (const { word, id } of words) {
      const p = this.deps.defRepo.getAllByWordIdAndTelegram(id as number, userId).then(def => {
        output.push({
          word,
          meanings: def.map(d => d.definition)
        });
      });
      promises.push(p);
    }

    await Promise.all(promises);
    return output;
  }

}