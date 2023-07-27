import { BotDependencies } from "../create-bot";
import { CreateDefinitionStatePayload } from "../states/CreateDefinitionState";
import { ICreateDefinitionPresenter } from "./ICreateDefinitionPresenter";
import { CreateDefinitionModel, CreateDefinitionStateMeaning } from "../data/CreateDefinitionModel";
import { ICreateDefinitionView } from "../views/ICreateDefinitionView";
import { AbstractPresenter } from "./AbstractPresenter";
import { addWordWithOwner } from "../../usecases/add-word-with-owner";
import { addDefinitionsWithOwner } from "../../usecases/add-definitions-with-owner";
import { deleteDefinitionsOwnership } from "../../usecases/delete-definitions-ownership";
import { IWord } from "../../entities/IWord";
import { SanitizedWordString } from "../../utils/sanitize";

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

  async onContinue() : Promise<boolean> {
    const { meanings, userId: telegramId, word : wordText} = this.model.data;
    const { userRepo, defRepo, wordRepo } = this.deps;
    try {
      const word = await addWordWithOwner(telegramId, wordText as SanitizedWordString, userRepo, wordRepo);

      const newDefs = meanings
        .filter((m) => m.use && !m.fromDb)
      await addDefinitionsWithOwner(telegramId, word, newDefs, defRepo, wordRepo, userRepo);

      const removedDefIds = meanings
        .filter((m) => !m.use && m.fromDb && typeof m.id === "number" && !isNaN(m.id))
      await deleteDefinitionsOwnership(telegramId, word, removedDefIds, defRepo, wordRepo, userRepo);

      return true;
    } catch (error) {
      // todo logger
      this.deps.logger.error("create-def-presenter: saving word", error);
      return false;
    }
  }
}
