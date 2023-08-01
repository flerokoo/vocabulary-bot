import { AbstractPresenter } from "./AbstractPresenter";
import { ILearnPresenter } from "./ILearnPresenter";
import { LearnStateModel, LearnStateModelData } from "../data/LearnStateModel";
import { BotDependencies } from "../create-bot";
import { LearnStatePayload } from "../states/LearnState";
import { ILearnView } from "../views/ILearnView";
import { IWord } from "../../entities/IWord";

export class LearnPresenter extends AbstractPresenter<ILearnView> implements ILearnPresenter {
  constructor(
    private model: LearnStateModel,
    private deps: BotDependencies
  ) {
    super();
    model.subscribe((data) => {
      this.updateView(data);
    });
  }

  private async updateView(data: LearnStateModelData) {
    await this.view?.showQuestion(data.mode, data.current, data.showAnswer, data.questionsInSession);
  }

  onShow({ mode, tags }: LearnStatePayload, userId: number): void {
    this.deps.logger.log(`User entered learn mode`, { userId, mode, tags });
    this.model.setUserId(userId);
    this.model.setActive(true);
    this.model.setMode(mode);
    this.model.setTags(tags);
    this.loadNewQuestion();
  }

  reset(): void {
    this.deps.logger.log(`User exited learn mode`, { userId: this.model.data.userId });
    this.model.cleanup();
    this.view.cleanup();
  }

  async onNextQuestionRequest(): Promise<any> {
    await this.loadNewQuestion();
  }

  onShowAnswerRequest() {
    this.model.setShowAnswer(true);
  }

  private async loadNewQuestion() {
    const { userId, tags } = this.model.data;

    const wordObj = await this.deps.wordRepo.getRandomByUserIdAndTags(userId, tags);

    if (!wordObj) {
      return this.view.onNoQuestionsFound();
    }

    const word = wordObj.word;
    const data = await this.deps.defRepo.getAllByWordAndUserId(word, this.model.data.userId);
    const definitions = data.map((_) => _.definition);
    this.model.setShowAnswer(false);
    this.model.setCurrentQuestion({ word, definitions });
  }
}
