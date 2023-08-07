import { IMeaning } from "../../entities/IMeaning";

export interface ICreateDefinitionView {
  showDefinitions(meanings: IMeaning[], currentPage: number, totalPages: number, defsPerPage: number): Promise<void>;

  cleanup(): Promise<void>;
}
