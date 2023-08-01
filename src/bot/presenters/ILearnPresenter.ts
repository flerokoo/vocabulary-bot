import { LearnStatePayload } from "../states/LearnState";

export interface ILearnPresenter {
  reset(): void;

  onShow(payload: LearnStatePayload, userId: number): void;
  
  onNextQuestionRequest(): Promise<any>;

  onShowAnswerRequest(): void;
}