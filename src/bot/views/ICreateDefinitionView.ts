import {IMeaning} from "../../usecases/entities/IMeaning";

export interface ICreateDefinitionView {
    showLoader(): Promise<void>;

    hideLoader(): Promise<void>;

    showDefinitions(meanings: IMeaning[]): Promise<void>;

    cleanup(): Promise<void>;
}