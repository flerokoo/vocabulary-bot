import { DataHolder } from "../../utils/data/DataHolder";
import { LearnMode } from "../states/SelectLearnModeState";
import { ITag } from "../../entities/ITag";

export type LearnStateModelData = {
  mode: LearnMode;
  current: { word: string; definitions: string[] } | undefined;
  showAnswer: boolean;
  userId: number;
  questionsInSession: number;
  isActiveState: boolean;
  tags: ITag[];
};

export class LearnStateModel extends DataHolder<LearnStateModelData> {
  cleanup() {
    this.setState({} as LearnStateModelData);
  }

  setMode(mode: LearnMode) {
    this.setState({ ...this.data, mode });
  }

  setUserId(id: number) {
    this.setState({ ...this.data, userId: id });
  }

  setCurrentQuestion(current: { word: string; definitions: string[] }) {
    this.setState({ ...this.data, current, questionsInSession: this.questionsInSession + 1 });
  }

  setShowAnswer(showAnswer: boolean) {
    this.setState({ ...this.data, showAnswer });
  }

  get questionsInSession() {
    return this.data.questionsInSession || 0;
  }

  setActive(isActiveState: boolean) {
    this.setState({ ...this.data, isActiveState });
  }

  setTags(tags: ITag[]) {
    this.setState({ ...this.data, tags });
  }
}
