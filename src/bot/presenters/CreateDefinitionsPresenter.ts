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
  implements ICreateDefinitionPresenter
{
  constructor(
    private model: CreateDefinitionModel,
    private deps: BotDependencies,
  ) {
    super();
    model.subscribe((data) => {
      if (data?.meanings && this.view) this.view.showDefinitions(data.meanings);
    });
  }

  async onShow(payload: CreateDefinitionStatePayload, userId: number) {
    this.model.setWord(payload.word);
    this.model.setUserId(userId);
    if (payload.isNewWord) {
      const defs = await this.deps.defProvider(payload.word);
      this.model.setDefinitions(defs);
    } else {
      const defs = await this.deps.defRepo.getAllByWordAndUserId(payload.word, userId);
      const defsUsed: CreateDefinitionStateMeaning[] = defs.map((d) => ({
        ...d,
        selected: true,
        existsInDatabase: true,
      }));
      this.model.setDefinitions(defsUsed);
    }
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

  async onContinue(): Promise<[boolean, number]> {
    const { meanings, userId, word: wordText } = this.model.data;
    const { userRepo, defRepo, wordRepo } = this.deps;
    try {
      const word = await addWordWithOwner(userId, wordText as SanitizedWordString, userRepo, wordRepo);

      const newDefs = meanings.filter((m) => m.selected && !m.existsInDatabase);
      await addDefinitionsWithOwner(userId, word, newDefs, defRepo, wordRepo);

      const removedDefIds = meanings.filter(
        (m) => !m.selected && m.existsInDatabase && typeof m.id === "number" && !isNaN(m.id),
      );
      await deleteDefinitionsOwnership(userId, word, removedDefIds, defRepo, wordRepo);
      this.deps.logger.log(`Saved or updated word`, {userId, word})
      return [true, word.id as number];
    } catch (error) {
      this.deps.logger.error("create-def-presenter: saving word", error);
      return [false, -1];
    }
  }
}
