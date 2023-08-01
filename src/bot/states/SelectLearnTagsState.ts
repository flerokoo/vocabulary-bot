import { LearnMode } from "./SelectLearnModeState";
import { LearnStatePayload } from "./LearnState";
import { ITagRepository } from "../../db/ITagRepository";
import { PayloadConverter, SelectTagsState } from "./SelectTagsState";

export type SelectLearnTagsStatePayload = { mode: LearnMode };

export class SelectLearnTagsState extends SelectTagsState<SelectLearnTagsStatePayload, LearnStatePayload> {
  constructor(userId: number, tagRepo: ITagRepository) {
    const mainText = `Select tags to use while learning`;
    const handler: PayloadConverter<SelectLearnTagsStatePayload, LearnStatePayload> = ({ mode }, tags) => ({
      tags,
      mode,
    });
    super(userId, mainText, tagRepo, "learn", handler);
  }
}
