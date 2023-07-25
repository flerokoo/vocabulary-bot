import { DataHolder } from "../../utils/data/DataHolder";

export type LearnStateModelData = {
  mode: "definitions" | "words" | undefined,
  current: { word: string, definition: string } | undefined,
  showAnswer: boolean,
  chatId: string,
  questionsInSession: number,
  isActiveState: boolean
}

export class LearnStateModel extends DataHolder<LearnStateModelData> {
  cleanup() {
    this.setState({} as LearnStateModelData);
  }

  setMode(mode: "definitions" | "words") {
    this.setState({...this.data, mode})
  }

  setUserId(id : string) {
    this.setState({...this.data, chatId: id})
  }

  setCurrentQuestion(current: { word: string; definition: string }) {
    this.setState({...this.data, current, questionsInSession: this.questionsInSession + 1})
  }

  setShowAnswer(showAnswer: boolean) {
    this.setState({ ...this.data, showAnswer})
  }

  get questionsInSession() {
    return this.data.questionsInSession || 0;
  }

  setActive(isActiveState: boolean) {
    this.setState({ ...this.data, isActiveState})
  }
}