import { IMeaning } from "../../entities/IMeaning";

export interface ICreateDefinitionView {

  showDefinitions(meanings: IMeaning[]): Promise<void>;

  cleanup(): Promise<void>;
}
