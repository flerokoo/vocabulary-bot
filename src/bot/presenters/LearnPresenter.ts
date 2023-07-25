import { AbstractPresenter } from "./AbstractPresenter";
import { ILearnPresenter } from "./ILearnPresenter";
import { LearnStateModel, LearnStateModelData } from "../data/LearnStateModel";
import { BotDependencies } from "../create-bot";
import { LearnStatePayload } from "../states/LearnState";
import { ILearnView } from "../views/ILearnView";

export class LearnPresenter extends AbstractPresenter<ILearnView> implements ILearnPresenter {
  constructor(
    private model: LearnStateModel,
    private deps: BotDependencies) {
    super();
    model.subscribe((data) => this.updateView(data));
  }

  private async updateView(data: LearnStateModelData) {

    if (data.mode === undefined) {
      return this.view.showModePrompt();
    }

    if (!data.current) {
      return this.loadNewQuestion();
    }

    await this.view.showQuestion(data.mode, data.current, data.showAnswer, data.questionsInSession);
  }

  onShow(payload: LearnStatePayload, userId: string): void {
    this.model.setUserId(userId);
    this.updateView(this.model.data);
  }

  reset(): void {
    this.model.cleanup();
    this.view.cleanup();
  }

  onModeRequested(mode: "definitions" | "words"): void {
    this.model.setMode(mode);
  }

  async onNextQuestionRequest(): Promise<any> {
    await this.loadNewQuestion();
  }

  onShowAnswerRequest() {
    this.model.setShowAnswer(true);
  }


  private async loadNewQuestion() {
    const rand = await this.deps.defRepo.getRandomByTelegram(this.model.data.chatId);
    if (!rand) {
      this.view.onNoQuestionsFound();
    }
    this.model.setShowAnswer(false);
    this.model.setCurrentQuestion(rand);
  }
}