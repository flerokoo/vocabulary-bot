import { AssignTagsStateModelData } from "../data/AssignTagsStateModel";

export interface IAssignStateView {
  updateView(data: AssignTagsStateModelData): void;
}