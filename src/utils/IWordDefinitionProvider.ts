import { SanitizedWordString } from "./sanitize";
import { IMeaning } from "../entities/IMeaning";

export default interface IWordDefinitionProvider {
  (word: SanitizedWordString): Promise<IMeaning[]>;
}
