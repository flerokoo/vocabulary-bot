import { LearnMode } from "./SelectLearnModeState";
import { LearnState, LearnStatePayload } from "./LearnState";
import { ITagRepository } from "../../db/ITagRepository";
import { PayloadConverter, SelectTagsState } from "./SelectTagsState";
import { ListState, ListStatePayload } from "./ListState";

export type SelectListTagsStatePayload = void;

export class SelectListTagsState extends SelectTagsState<SelectListTagsStatePayload, ListStatePayload> {
  constructor(userId: number, tagRepo: ITagRepository) {
    const mainText = `Select tags before listing words`;
    const handler: PayloadConverter<SelectListTagsStatePayload, ListStatePayload> = ( _, tags) => ({
      tags
    });
    super(userId, mainText, tagRepo, ListState, handler);
  }
}
