import { ITag } from "../../entities/ITag";
import { AbstractState } from "./AbstractState";
import TelegramBot from "node-telegram-bot-api";
import { MainState } from "./MainState";
import { BotDependencies } from "../create-bot";
import { splitByCharCount } from "../../utils/split-by-char-count";

export type ListStatePayload = { tags: ITag[] }

export class ListState extends AbstractState<ListStatePayload> {
  constructor(userId: number, private deps: BotDependencies) {
    super(userId);
  }

  async enter(payload: ListStatePayload) {

    const words = await (payload.tags?.length > 0
      ? this.deps.wordRepo.getAllByUserIdAndTags(this.userId, payload.tags)
      : this.deps.wordRepo.getAllByUserId(this.userId));
    const tagsMsg = payload.tags.map(_ => _.tag).join(", ");
    const joined = words.length > 0
      ? `*List of you saved words (tags: ${tagsMsg}):* \n` + words.map(_ => _.word).sort().join("\n")
      : `*No words found (tags: ${tagsMsg})*`
    const msgs = splitByCharCount(joined, 3000);
    for (const msg of msgs) {
      await this.context.sendMessage(msg, { parse_mode: "Markdown" });
    }

    this.context.setState(MainState);
  }

  exit(): void {
  }

  handleCallbackQuery(query: TelegramBot.CallbackQuery): void {
  }

  handleMessage(message: TelegramBot.Message): void {
  }

}