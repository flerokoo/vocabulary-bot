import { ITagRepository } from "../../db/ITagRepository";
import { PayloadConverter, SelectTagsState } from "./SelectTagsState";
import { ExportState, ExportStatePayload } from "./ExportState";

export type SelectExportTagsStatePayload = void;

export class SelectExportTagsState extends SelectTagsState<SelectExportTagsStatePayload, ExportStatePayload> {
  constructor(userId: number, tagRepo: ITagRepository) {
    const mainText = `Select tags to export`;
    const handler: PayloadConverter<SelectExportTagsStatePayload, ExportStatePayload> = (_, tags) => ({ tags });
    super(userId, mainText, tagRepo, ExportState, handler);
  }
}
