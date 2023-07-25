import { SanitizedWordString } from "../utils/sanitize";

export interface IWord {
  readonly id?: number;
  readonly word: SanitizedWordString;
}
