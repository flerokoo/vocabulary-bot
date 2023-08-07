import { AbstractState } from "./AbstractState";
import TelegramBot from "node-telegram-bot-api";
import { sanitize } from "../../utils/sanitize";
import { CreateDefinitionState } from "./CreateDefinitionState";
import { BotDependencies } from "../create-bot";
import { deleteWordOwnership } from "../../usecases/delete-word-ownership";
import { getAllWordsByUser } from "../../usecases/get-all-words-by-user";
import { SelectExportTagsState } from "./SelectExportTagsState";
import { SelectLearnModeState } from "./SelectLearnModeState";
import { SelectListTagsState } from "./SelectListTagsState";

export type MainStatePayload = void;

const HELP_MESSAGE = `
Use this bot and [Anki](https://en.wikipedia.org/wiki/Anki_%28software%29) to learn new english words.
To start just *send the word you want to add to your dictionary as a message*.

Available commands:
/help — to show this message
/list — to list all words in your dictionary
/export — to export your dictionary as an Anki deck
/remove word — to remove the word from your dictionary
/learn — start a learning mode

To edit word definitions just write it in the chat

Contact author: @starina\\_biba
`;

export class MainState extends AbstractState<MainStatePayload> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  commands: { [key: string]: Function } = {
    "/start": () =>
      this.context.sendMessage(HELP_MESSAGE, {
        parse_mode: "Markdown",
        disable_web_page_preview: true
      }),
    "/help": () =>
      this.context.sendMessage(HELP_MESSAGE, {
        parse_mode: "Markdown",
        disable_web_page_preview: true
      }),
    "/list": async () =>
      this.context.setState(SelectListTagsState),
    "/remove": async (word: string) => {
      try {
        await deleteWordOwnership(this.userId, { word }, this.deps.wordRepo);
        await this.context.sendMessage("Removed this word from your dictionary");
      } catch (error) {
        this.logger.error(error);
        await this.context.sendMessage("Error occurred while removing word");
      }
    },
    "/export": () => this.context.setState(SelectExportTagsState),
    "/learn": async () => {
      const word = await this.deps.defRepo.getRandomByUserId(this.userId);
      if (!word) return await this.context.sendMessage("Add some words first");
      this.context.setState(SelectLearnModeState);
    }
  };

  constructor(
    userId: number,
    private deps: BotDependencies
  ) {
    super(userId);
  }

  enter() {
  }

  exit() {
  }

  async handleMessage(message: TelegramBot.Message) {
    if (!message.text || message.chat.id < 0) return;// this bot is not for groups
    if (message.text?.startsWith("/") && message.text.length > 1) {
      this.handleCommand(message);
      return;
    }
    const word = sanitize(message.text);
    if (word.length === 0) return;
    const isNewWordForThisUser = await this.deps.wordRepo.isWordOwnedByUserId(word, this.userId);
    if (isNewWordForThisUser) {
      this.defineWord(word);
    } else {
      this.createAndDefineWord(word);
    }
  }

  private handleCommand(message: TelegramBot.Message) {
    if (message.chat.id < 0) return; // this bot is not for groups
    const text = message!.text as string;
    const [command_, ...args] = text.replace(/\s+/g, " ").split(" ");
    const command = command_.toLowerCase();
    if (!(command in this.commands)) return;
    this.commands[command](...args);
  }

  handleCallbackQuery(): void {
  }

  private defineWord(word: string) {
    this.context.setState(CreateDefinitionState, { word, isNewWord: false });
  }

  private createAndDefineWord(word: string) {
    this.context.setState(CreateDefinitionState, { word, isNewWord: true });
  }

  private get logger() {
    return this.deps.logger;
  }
}
