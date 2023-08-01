import { CreateDefinitionStatePayload } from "../states/CreateDefinitionState";

export interface ICreateDefinitionPresenter {
  onShow(payload: CreateDefinitionStatePayload, userId: number): void;

  addDefinition(text: string): void;

  toggleDefinitionUsage(data: string | undefined): void;

  reset(): void;

  onContinue(): Promise<[boolean, number]>;
}
