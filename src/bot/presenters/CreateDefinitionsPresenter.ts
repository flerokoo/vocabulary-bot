import { BotDependencies } from "../create-bot";
import { CreateDefinitionStatePayload } from "../states/CreateDefinitionState";
import { ICreateDefinitionPresenter } from "./ICreateDefinitionPresenter";
import { CreateDefinitionModel, CreateDefinitionStateMeaning } from "../data/CreateDefinitionModel";
import { ICreateDefinitionView } from "../views/ICreateDefinitionView";
import { AbstractPresenter } from "./AbstractPresenter";
import { addWordWithOwner } from "../../usecases/add-word-with-owner";
import { addDefinitionsWithOwner } from "../../usecases/add-definitions-with-owner";
import { deleteDefinitionsOwnership } from "../../usecases/delete-definitions-ownership";
import { SanitizedWordString } from "../../utils/sanitize";
import { IMeaning } from "../../entities/IMeaning";

export class CreateDefinitionsPresenter
  extends AbstractPresenter<ICreateDefinitionView>
  implements ICreateDefinitionPresenter {
  constructor(
    private model: CreateDefinitionModel,
    private deps: BotDependencies
  ) {
    super();
    model.subscribe((data) => {
      if (data?.meanings && this.view)
        this.view.showDefinitions(data.meanings, model.currentPage, model.totalPages, data.defsPerPage);
    });
  }

  async onShow(payload: CreateDefinitionStatePayload, userId: number) {
    this.model.setWord(payload.word);
    this.model.setUserId(userId);
    if (payload.isNewWord) {
      const defs = await this.loadDefinitions(payload.word);
      this.model.setDefinitions(defs);
    } else {
      const defs = await this.deps.defRepo.getAllByWordAndUserId(payload.word, userId);
      const defsUsed: CreateDefinitionStateMeaning[] = defs.map((d) => ({
        ...d,
        selected: true,
        existsInDatabase: true
      }));
      this.model.setDefinitions(defsUsed);
    }
  }

  private async loadDefinitions(word: string) {
    try {
      const defs = await this.deps.defProvider(word);
      return this.trimDefinitions(defs);
    } catch (err: any) {
      this.deps.logger.error(`Error when loading definitions`, err);
    }
    return [];
  }

  private trimDefinitions(defs: IMeaning[]) {
    const MAX = 2500;
    const out = [];
    let totalLength = 0;
    for (const obj of defs) {
      const { definition } = obj;
      if (definition.length + totalLength >= MAX) break;
      out.push(obj);
      totalLength += definition.length;
    }
    console.log(totalLength)
    return out;
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
        (m) => !m.selected && m.existsInDatabase && typeof m.id === "number" && !isNaN(m.id)
      );
      await deleteDefinitionsOwnership(userId, word, removedDefIds, defRepo, wordRepo);
      this.deps.logger.log(`Saved or updated word`, { userId, word });
      return [true, word.id as number];
    } catch (error) {
      this.deps.logger.error("create-def-presenter: saving word", error);
      return [false, -1];
    }
  }

  onNextPageRequested() {
    this.model.advancePage(1);
  }

  onPrevPageRequested() {
    this.model.advancePage(-1);
  }
}

