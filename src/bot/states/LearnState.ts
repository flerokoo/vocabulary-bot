import { AbstractState } from "./AbstractState";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { ILearnPresenter } from "../presenters/ILearnPresenter";
import { ILearnView } from "../views/ILearnView";
import { AsyncQueue } from "../../utils/AsyncQueue";


export type LearnStatePayload = void;
const NEXT_QD = "next";
const SET_DEF_MODE_QD = "def_mode";
const SET_WORD_MODE_QD = "word_mode";
const SHOW_ANSWER_QD = "show_answer";
const EXIT_QD = "exit";

export class LearnState
  extends AbstractState<BotStateId, LearnStatePayload, void>
  implements ILearnView {
  private mainView!: TelegramBot.Message | undefined;
  private mainViewPromise: Promise<void | TelegramBot.Message> | undefined;
  private state!: undefined | "mode_select" | "learning";
  private updateQueue: AsyncQueue = new AsyncQueue();

  constructor(private presenter: ILearnPresenter) {
    super();
  }

  async enter(payload: LearnStatePayload) {
    this.presenter.onShow(payload, this.context.chatId.toString());
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

    if (query.data === EXIT_QD) {
      await answer("Good job");
      return this.context.setState("main");
    }

    const setModeData = [SET_DEF_MODE_QD, SET_WORD_MODE_QD] as string[];
    if (setModeData.indexOf(query.data) > -1) {
      await answer("Learning by definitions");
      this.state = "learning";
      return this.presenter.onModeRequested(query.data === SET_DEF_MODE_QD ? "definitions" : "words");
    }

    if (query.data === NEXT_QD) {
      await answer("Moving on...");
      return this.presenter.onNextQuestionRequest();
    }

    if (query.data === SHOW_ANSWER_QD) {
      await answer("Showing answer");
      return this.presenter.onShowAnswerRequest();
    }

  }

  private async ensureView() {
    if (this.mainView) return Promise.resolve();
    if (this.mainViewPromise) return this.mainViewPromise;
    this.mainViewPromise = this.context.sendMessage("Loading...").then(msg => {
      this.mainView = msg;
      this.mainViewPromise = undefined;
    });
    return this.mainViewPromise;
  }

  async cleanup() {
    this.updateQueue.clear();
    if (!this.mainView) return;
    const mainView = this.mainView;
    this.mainView = undefined;
    this.state = undefined;
    this.updateQueue.add(async () => {
      await this.context.deleteMessage(mainView.message_id);
    });
  }

  async showModePrompt() {
    if (this.state === "mode_select") return;
    this.state = "mode_select";
    await this.ensureView();
    const inline_keyboard: InlineKeyboardButton[][] = [
      [
        {
          text: "📘 Words",
          callback_data: SET_WORD_MODE_QD
        },
        {
          text: "📖 Definitions",
          callback_data: SET_DEF_MODE_QD
        }
      ],
      [{
        text: "❌ Cancel",
        callback_data: EXIT_QD
      }]
    ];
    this.updateQueue.add(async () => {
      await this.context.editMessageText("Select learning mode", {
        message_id: this.mainView?.message_id,
        reply_markup: { inline_keyboard }
      });
    });
  }

  async showQuestion(mode: "words" | "definitions",
                     current: { word: string; definition: string } | undefined,
                     showAnswer: boolean, questionsInSession: number): Promise<void> {
    if (!current) return;
    await this.ensureView();

    const inline_keyboard: InlineKeyboardButton[][] = [];
    inline_keyboard.push([{ text: "➡️ Next", callback_data: NEXT_QD }]);
    if (!showAnswer)
      inline_keyboard[0].unshift({ text: "💡️ Show answer", callback_data: SHOW_ANSWER_QD });
    inline_keyboard.push([{ text: "❌ Exit", callback_data: EXIT_QD }]);


    let text = `*Question:* ` + (mode === "words" ? current.word : current.definition);
    if (showAnswer)
      text += "\n*Answer:* " + (mode === "words" ? current.definition : current.word);

    text += "\n\n*Words in this session:* " + questionsInSession;

    this.updateQueue.add(async () => {
      await this.context.editMessageText(text, {
        message_id: this.mainView?.message_id,
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
