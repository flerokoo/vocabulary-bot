import { DataHolder } from "../../utils/data/DataHolder";
import { IMeaning } from "../../entities/IMeaning";
import { SanitizedWordString } from "../../utils/sanitize";

export interface CreateDefinitionStateMeaning extends IMeaning {
  selected: boolean; // selected during create definition process
  existsInDatabase?: boolean; // exists in database
}

export type CreateDefinitionModelData = {
  meanings: CreateDefinitionStateMeaning[];
  word: SanitizedWordString;
  userId: number;
  page: number;
  defsPerPage: number
};

export class CreateDefinitionModel extends DataHolder<CreateDefinitionModelData> {

  constructor(data: CreateDefinitionModelData, private definitionsPerPage : number = 12) {
    data.page ||= 0;
    data.defsPerPage = definitionsPerPage;
    super(data);
  }

  setDefinitions(meanings: IMeaning[] | CreateDefinitionStateMeaning[]) {
    const newMeanings = meanings.map((m) => ({
      selected: false,
      ...m,
    }));
    this.setState({ ...this.data, meanings: newMeanings });
  }

  addDefinition(meaning: IMeaning, use = true) {
    const newMeanings = this.data?.meanings ? this.data.meanings.map((m) => ({ ...m })) : [];
    newMeanings.push({ ...meaning, selected: use });
    this.setState({ ...this.data, meanings: newMeanings });
  }

  setWord(word: string) {
    this.setState({ ...this.data, word });
  }

  setUserId(userId: number) {
    this.setState({ ...this.data, userId });
  }

  toggleDefinitionUsage(i: number) {
    if (!this.data?.meanings?.length) return;
    if (isNaN(i)) return;
    if (i < 0 || i >= this.data.meanings.length) return;
    const obj = this.data.meanings[i];
    obj.selected = !obj.selected;
    this.setState(this.data);
  }

  cleanup() {
    this.setState({ page: 0, defsPerPage: this.definitionsPerPage } as CreateDefinitionModelData);
  }

  get totalPages() {
    return Math.ceil(this.data.meanings.length / this.data.defsPerPage);
  }

  get currentPage() {
    return isNaN(Number(this.data.page)) ? 0 : this.data.page;
  }

  get isLastPage() {
    return this.currentPage === this.totalPages - 1;
  }

  get isFirstPage() {
    return this.currentPage == 0
  }

  advancePage(n : number) {
    const newPage = Math.max(0, Math.min(this.totalPages - 1, this.currentPage + n));
    if (newPage !== this.data.page)
      this.setState({ ...this.data, page: newPage });
  }
}
