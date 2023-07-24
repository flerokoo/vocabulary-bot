import { AbstractState } from "./AbstractState";
import TelegramBot from "node-telegram-bot-api";
import { sanitize } from "../../utils/sanitize";
import { BotStateId } from "./BotStateId";
import { CreateDefinitionStatePayload } from "./CreateDefinitionState";
import { BotDependencies } from "../create-bot";

export type MainStatePayload = void;

const HELP_MESSAGE = `
Use this bot and [Anki](https://en.wikipedia.org/wiki/Anki_%28software%29) to learn new english words.
To start just *send the word you want to add to your dictionary as a message*.

Available commands:
/help — to show this message
/list — to list all words in your dictionary
/export — to export your dictionary as an Anki deck
/remove _word_ — to remove the word from your dictionary

To edit word definitions just write it in the chat
`;

export class MainState extends AbstractState<BotStateId, MainStatePayload, CreateDefinitionStatePayload> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  commands: { [key: string]: Function } = {
    "/start": () =>
      this.context.sendMessage(HELP_MESSAGE, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    "/help": () =>
      this.context.sendMessage(HELP_MESSAGE, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    "/list": async () => {
      const header = "*List of your saved words:* \n";
      const words = await this.deps.wordRepo.getAllByTelegramId(this.context.chatId.toString());
      const msg = words.length === 0 ? "No saved words found" : header + words.map((w) => w.word).join("\n");
      await this.context.sendMessage(msg, { parse_mode: "Markdown" });
    },
    "/remove": async (word: string) => {
      await this.deps.wordRepo.removeOwnershipByWordAndTelegram(word, this.context.chatId.toString());
      await this.context.sendMessage("Removed this word from your dictionary");
    },
    "/export": () => this.context.setState("export")
  };

  constructor(private deps: BotDependencies) {
    super();
  }

  enter() {}

  exit() {}

  async handleMessage(message: TelegramBot.Message) {
    if (!message.text) return;
    if (message.text?.startsWith("/") && message.text.length > 1) {
      this.handleCommand(message);
      return;
    }
    const word = sanitize(message.text);
    if (word.length === 0) return;
    const isNewWordForThisUser = await this.deps.wordRepo.isWordOwnedByTelegram(word, this.context.chatId.toString());
    if (isNewWordForThisUser) {
      this.defineWord(word);
    } else {
      this.createAndDefineWord(word);
    }
  }

  private handleCommand(message: TelegramBot.Message) {
    const text = message!.text as string;
    const [command_, ...args] = text.replace(/\s+/g, " ").split(" ");
    const command = command_.toLowerCase();
    if (!(command in this.commands)) return;
    this.commands[command](...args);
  }

  handleCallbackQuery(): void {}

  private defineWord(word: string) {
    this.context.setState("create-definition", { word, isNewWord: false });
  }

  private createAndDefineWord(word: string) {
    this.context.setState("create-definition", { word, isNewWord: true });
  }
}
