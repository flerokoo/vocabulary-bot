export interface ILearnView {
  cleanup(): void;

  showModePrompt(): void;

  showQuestion(mode: "words" | "definitions",
               current: { word: string; definition: string } | undefined,
               showAnswer: boolean, questionsInSession: number): Promise<void>;

  onNoQuestionsFound(): void;
}