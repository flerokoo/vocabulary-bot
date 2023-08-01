import { AbstractPresenter } from "./AbstractPresenter";
import { IAssignStatePresenter } from "./IAssignStatePresenter";
import { AssignTagsStateModel } from "../data/AssignTagsStateModel";
import { BotDependencies } from "../create-bot";
import { ChatId } from "node-telegram-bot-api";
import { ITag } from "../../entities/ITag";
import { updateWordTags } from "../../usecases/update-word-tags";
import { IAssignStateView } from "../views/IAssignStateView";

export class AssignTagsPresenter extends AbstractPresenter<IAssignStateView> implements IAssignStatePresenter {
  constructor(private model: AssignTagsStateModel, private deps: BotDependencies) {
    super();
    model.subscribe((data) => {
      this.view?.updateView(data);
    });
  }

  async onShow(userId: number, chatId: ChatId, wordId: number) {
    this.model.setUserData(userId, chatId);
    this.model.setWordId(wordId);
    const tags = await this.deps.tagRepo.getAllTagsByUserId(userId);
    const mapper = (tag: ITag) =>
      this.deps.tagRepo.isTagAssigned(userId, tag.id, wordId)
        .then(selected => ({ tag, selected }));
    const selectedTags = await Promise.all(tags.map(mapper));
    this.model.setTags(selectedTags);
  }

  async onAddNewTag(text: string) {
    const tag = await this.deps.tagRepo.getOrAddTag(text);
    await this.deps.tagRepo.addOwnership(tag.id, this.model.data.userId);
    this.model.addNewTag(tag);
  }

  async onToggleTagUsage(tag: string) {
    this.model.toggleTagUsage(tag);
  }

  async onSaveRequest(): Promise<boolean> {
    const { tags, userId, wordId } = this.model.data;
    const usedTags = tags.filter(_ => _.selected).map(_ => _.tag);
    const unusedTags = tags.filter(_ => !_.selected).map(_ => _.tag);
    const { tagRepo } = this.deps;
    try {
      await updateWordTags(userId, wordId, usedTags, unusedTags, tagRepo);
      return true;
    } catch (error) {
      return false;
    }
  }
}