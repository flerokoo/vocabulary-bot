import {CreateDefinitionStatePayload} from "../states/CreateDefinitionState";

export interface ICreateDefinitionPresenter {

    onShow(payload: CreateDefinitionStatePayload, userId: string): void;

    addDefinition(text: string): void;

    toggleDefinitionUsage(data: string | undefined): void;

    reset(): void;

    onContinue(): void;
}