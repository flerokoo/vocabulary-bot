import { LearnStatePayload } from "../states/LearnState";

export interface ILearnPresenter {
  reset(): void;

  onShow(payload: LearnStatePayload, s: string): void;

  onModeRequested(definitions: "definitions" | "words"): void;

  onNextQuestionRequest(): Promise<any>;

  onShowAnswerRequest(): void;
}