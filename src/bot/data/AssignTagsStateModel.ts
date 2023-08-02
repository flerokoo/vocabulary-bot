import { DataHolder } from "../../utils/data/DataHolder";
import { ITag } from "../../entities/ITag";
import { ChatId } from "node-telegram-bot-api";

export type AssignTagsStateModelData = {
  tags: { tag: ITag; selected: boolean }[];
  wordId: number;
  userId: number;
  chatId: ChatId;
};

export class AssignTagsStateModel extends DataHolder<AssignTagsStateModelData> {
  addNewTag(tag: ITag) {
    const existing = this.data.tags.find(_ => _.tag.id === tag.id);
    if (!existing) {
      this.data.tags.push({ tag, selected: true });
    } else {
      existing.selected = true;
    }
    this.setState(this.data);
  }

  setUserData(userId: number, chatId: ChatId) {
    this.setState({ ...this.data, userId, chatId });
  }

  setWordId(wordId: number) {
    this.setState({ ...this.data, wordId });
  }

  setTags(newTags: { tag: ITag; selected: boolean }[]) {
    this.setState({ ...this.data, tags: newTags });
  }

  toggleTagUsage(tag: string) {
    const tagObj = this.data.tags.find((o) => o.tag.tag === tag);
    if (!tagObj) return;
    tagObj.selected = !tagObj.selected;
    this.setState(this.data);
  }
}
