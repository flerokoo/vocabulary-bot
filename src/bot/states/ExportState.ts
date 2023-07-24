import { AbstractState } from "./AbstractState";
import { BotStateId } from "./BotStateId";
import { MainStatePayload } from "./MainState";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { ICardExporter } from "../../export/ICardExporter";
import { ICard } from "../../entities/ICard";
import { BotDependencies } from "../create-bot";

export type ExportStatePayload = void;

function formatFilename(base: string, ext: string) {
  if (!ext.startsWith(".")) ext = `.${ext}`;
  const date = new Date();
  return `Export_${base}_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}${ext}`;
}

async function exportAnkiDeck(cards: ICard[]) {
  return {
    data: "anki",
    filename: formatFilename("AnkiDeck", "apkg")
  };
}

async function exportJson(cards: ICard[]) {
  return {
    data: "json",
    filename: formatFilename("JsonBackup", "json")
  };
}

const CANCEL_QUERY_DATA = "cancel";

export class ExportState extends AbstractState<BotStateId, ExportStatePayload, MainStatePayload> {

  exporters: { [key: string]: ICardExporter } = {
    "Anki Deck": exportAnkiDeck,
    "Json": exportJson
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
    const cards = await this.getCards();
    if (cards.length === 0) {
      await bail("No words to export");
    }

    const { filename, data: dataToExport } = await exporter(cards);
    console.log(dataToExport);
    await this.context.sendDocument(dataToExport, {}, { filename, contentType: "application/octet-stream" });
    await bail("Exported successfully");
  }

  handleMessage(): void {
  }

  async getCards() {
    const userId = this.context.chatId.toString();
    const words = await this.deps.wordRepo.getAllByTelegramId(userId);
    const cards: ICard[] = [];

    const promises = [];
    for (const word of words) {
      const p = this.deps.defRepo.getAllByWordIdAndTelegram(word.id, userId).then(def => {
        const back = def.map(d => d.definition).join("\n\n");
        cards.push({ front: word.word, back });
      });
      promises.push(p);
    }

    await Promise.all(promises);
    console.log(cards);
    return cards;
  }

}