import { AbstractState } from "./AbstractState";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { ILearnPresenter } from "../presenters/ILearnPresenter";
import { ILearnView } from "../views/ILearnView";
import { AsyncQueue } from "../../utils/AsyncQueue";
import { LearnMode } from "./SelectLearnModeState";
import { EXIT_QUERY_DATA, SHOW_ANSWER_QUERY_DATA, NEXT_PAGE_QUERY_DATA } from "../common/query-data-constants";
import { ITag } from "../../entities/ITag";


export type LearnStatePayload = { mode: LearnMode, tags: ITag[] };

export class LearnState
  extends AbstractState<BotStateId, LearnStatePayload, void>
  implements ILearnView {
  private mainView!: TelegramBot.Message | undefined;
  private updateQueue: AsyncQueue = new AsyncQueue();

  constructor(userId: number, private presenter: ILearnPresenter) {
    super(userId);
  }

  async enter(payload: LearnStatePayload) {
    this.updateQueue.add(async () => {
      this.mainView = await this.context.sendMessage("Loading...");
    });
    this.presenter.onShow(payload, this.userId);
  }

  exit() {
    this.presenter.reset();
  }

  async handleMessage() {
  }

  async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    if (typeof query.data === "undefined") return;

    const answer = (text: string) => this.context.answerCallbackQuery(
      query.id, { text, callback_query_id: query.id });

    if (query.data === EXIT_QUERY_DATA) {
      await answer("Good job");
      return this.context.setState("main");
    }

    if (query.data === NEXT_PAGE_QUERY_DATA) {
      await answer("Moving on...");
      return this.presenter.onNextQuestionRequest();
    }

    if (query.data === SHOW_ANSWER_QUERY_DATA) {
      await answer("Showing answer");
      return this.presenter.onShowAnswerRequest();
    }

  }

  async cleanup() {
    this.updateQueue.clear();
    this.updateQueue.add(async () => {
      if (!this.mainView) return;
      await this.context.deleteMessage(this.mainView.message_id);
      this.mainView = undefined;
    });
  }


  async showQuestion(mode: LearnMode,
                     current: { word: string; definitions: string[] } | undefined,
                     showAnswer: boolean, questionsInSession: number): Promise<void> {
    if (!current) return;

    const inline_keyboard: InlineKeyboardButton[][] = [];
    inline_keyboard.push([{ text: "➡️ Next", callback_data: NEXT_PAGE_QUERY_DATA }]);
    if (!showAnswer)
      inline_keyboard[0].unshift({ text: "💡️ Show answer", callback_data: SHOW_ANSWER_QUERY_DATA });
    inline_keyboard.push([{ text: "↩️ Exit", callback_data: EXIT_QUERY_DATA }]);


    const word = "✴️ " + current.word;
    const definitions = current.definitions.map( _ => "❇️ " + _).join("\n");
    let text = `*Question:*\n ` + (mode === "Words" ? word : definitions);
    if (showAnswer)
      text += "\n\n*Answer:*\n" + (mode === "Words" ? definitions : word );

    text += "\n\n*Words in this session:* " + questionsInSession;

    this.updateQueue.add(async () => {
      await this.context.editMessageText(text, {
        message_id: this.mainView!.message_id,
        reply_markup: { inline_keyboard },
        parse_mode: "Markdown"
      });
    });


  }

  onNoQuestionsFound(): void {
    this.updateQueue.clear();
    this.updateQueue.add(async () => {
      await this.context.sendMessage("No words found");
      this.context.setState("main");
    });
  }
}
