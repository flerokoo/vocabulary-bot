import {BotDependencies} from "../create-bot";
import {
    CreateDefinitionStatePayload
} from "../states/CreateDefinitionState";
import {ICreateDefinitionPresenter} from "./ICreateDefinitionPresenter";
import {CreateDefinitionModel} from "../data/CreateDefinitionModel";
import {ICreateDefinitionView} from "../views/ICreateDefinitionView";

export class CreateDefinitionsPresenter implements ICreateDefinitionPresenter {

    constructor(private view: ICreateDefinitionView, private model: CreateDefinitionModel, private deps: BotDependencies) {
        model.subscribe(data => {
            if (data?.meanings)
                view.showDefinitions(data.meanings);
        })
    }

    async onShow(payload: CreateDefinitionStatePayload, userId: string) {
        this.model.setWord(payload.word);
        this.model.setUserId(userId);
        await this.view.showLoader();
        if (payload.isNewWord) {
            const defs = await this.deps.defProvider(payload.word);
            await this.view.hideLoader()
            this.model.setDefinitions(defs);
        } else {
            await this.view.showLoader();
            const defs = await this.deps.defRepo.getByWord(payload.word, userId)
            this.model.setDefinitions(defs);
        }
    }

    toggleDefinitionUsage(data: string): void {
        this.model.toggleDefinitionUsage(parseInt(data));
    }

    reset(): void {
        this.view.cleanup()
    }

    addDefinition(text: string): void {
        this.model.addDefinition({definition: text})
    }

    async onContinue() {
        // move this to use case
        const {meanings, userId, word} = this.model.data;
        const existing = await this.deps.wordRepo.getByText(word, userId);
        console.log(existing)

        const wordId = await this.deps.wordRepo.add(word, userId);
        const promises = meanings
            .filter(m => m.use)
            .map(m => this.deps.defRepo.add(wordId, userId, m.definition, ""));
        await Promise.all(promises);
    }

}