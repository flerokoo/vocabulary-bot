import { LearnMode } from "../states/SelectLearnModeState";

export interface ILearnView {
  cleanup(): void;


  showQuestion(mode: LearnMode,
               current: { word: string; definitions: string[] } | undefined,
               showAnswer: boolean, questionsInSession: number): Promise<void>;

  onNoQuestionsFound(): void;
}