import { BotDependencies } from "../create-bot";
import { CreateDefinitionStatePayload } from "../states/CreateDefinitionState";
import { ICreateDefinitionPresenter } from "./ICreateDefinitionPresenter";
import { CreateDefinitionModel, CreateDefinitionStateMeaning } from "../data/CreateDefinitionModel";
import { ICreateDefinitionView } from "../views/ICreateDefinitionView";

export class CreateDefinitionsPresenter implements ICreateDefinitionPresenter {
  constructor(
    private view: ICreateDefinitionView,
    private model: CreateDefinitionModel,
    private deps: BotDependencies
  ) {
    model.subscribe((data) => {
      if (data?.meanings) view.showDefinitions(data.meanings);
    });
  }

  async onShow(payload: CreateDefinitionStatePayload, userId: string) {
    this.model.setWord(payload.word);
    this.model.setUserId(userId);
    await this.view.showLoader();
    if (payload.isNewWord) {
      const defs = await this.deps.defProvider(payload.word);
      this.model.setDefinitions(defs);
    } else {
      const defs = await this.deps.defRepo.getAllByWord(payload.word, userId);
      const defsUsed: CreateDefinitionStateMeaning[] =
        defs.map((d) => ({ ...d, use: true, fromDb: true }));
      this.model.setDefinitions(defsUsed);
    }
    await this.view.hideLoader();
  }


  toggleDefinitionUsage(data: string): void {
    this.model.toggleDefinitionUsage(parseInt(data));
  }

  reset(): void {
    this.view.cleanup();
    this.model.cleanup();
  }

  addDefinition(text: string): void {
    this.model.addDefinition({ definition: text });
  }

  async onContinue() {
    // move this to use case
    const { meanings, userId, word } = this.model.data;
    const existing = await this.deps.wordRepo.getByText(word, userId);

    let wordId: number;
    if (existing) {
      wordId = existing.id;
    } else {
      wordId = await this.deps.wordRepo.add(word, userId);
    }

    const addPromises = meanings
      .filter((m) => m.use && !m.fromDb)
      .map((m) => this.deps.defRepo
        .add(wordId, userId, m.definition, ""));

    const removePromises = meanings
      .filter(m => !m.use && m.fromDb && typeof m.id === 'number' && !isNaN(m.id))
      .map(m => this.deps.defRepo.remove(m.id as number, userId));

    await Promise.all([...addPromises, ...removePromises]);
  }
}
