import { BotDependencies } from "../create-bot";
import { CreateDefinitionStatePayload } from "../states/CreateDefinitionState";
import { ICreateDefinitionPresenter } from "./ICreateDefinitionPresenter";
import { CreateDefinitionModel, CreateDefinitionStateMeaning } from "../data/CreateDefinitionModel";
import { ICreateDefinitionView } from "../views/ICreateDefinitionView";
import { AbstractPresenter } from "./AbstractPresenter";

export class CreateDefinitionsPresenter
  extends AbstractPresenter<ICreateDefinitionView>
  implements ICreateDefinitionPresenter {
  constructor(
    private model: CreateDefinitionModel,
    private deps: BotDependencies
  ) {
    super();
    model.subscribe((data) => {
      if (data?.meanings && this.view) this.view.showDefinitions(data.meanings);
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
      const defs = await this.deps.defRepo.getAllByWordAndTelegram(payload.word, userId);
      const defsUsed: CreateDefinitionStateMeaning[] = defs.map((d) => ({ ...d, use: true, fromDb: true }));
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
    const { meanings, userId : telegramId, word } = this.model.data;
    const wordId = await this.deps.wordRepo.addWord(word);

    const user = await this.deps.userRepo.getOrAdd(telegramId);

    await this.deps.wordRepo.addWordOwnership(wordId, user.id);

    const definitionIds = await Promise.all(meanings
      .filter((m) => m.use && !m.fromDb)
      .map((m) => this.deps.defRepo.add(wordId, m.definition)));

    const ownershipPromises = definitionIds.map(id =>
      this.deps.defRepo.addOwnership(id, user.id));

    const removePromises = meanings
      .filter((m) => !m.use && m.fromDb && typeof m.id === "number" && !isNaN(m.id))
      .map((m) => this.deps.defRepo.removeOwnershipByIdAndTelegram(m.id as number, telegramId));

    await Promise.all([...ownershipPromises, ...removePromises]);

    console.log(await this.deps.wordRepo.isWordOwnedByTelegram(word, telegramId))
  }
}
