import {Bot} from "./Bot";
import {BotStateId} from "./states/BotStateId";
import {MainState, MainStatePayload} from "./states/MainState";
import {CreateDefinitionState, CreateDefinitionStatePayload} from "./states/CreateDefinitionState";
import IWordDefinitionProvider from "../usecases/IWordDefinitionProvider";
import {BotContext} from "./BotContext";
import {IWordRepository} from "../usecases/IWordRepository";
import {IDefinitionRepository} from "../usecases/IDefinitionRepository";
import {CreateDefinitionsPresenter} from "./presenters/CreateDefinitionsPresenter";
import {CreateDefinitionModel, CreateDefinitionModelData} from "./data/CreateDefinitionModel";
import {TelegramCreateDefinitionView} from "./views/TelegramCreateDefinitionView";

export type PayloadUnion = CreateDefinitionStatePayload | MainStatePayload;

export type BotDependencies = {
    defProvider: IWordDefinitionProvider,
    wordRepo: IWordRepository,
    defRepo: IDefinitionRepository
}

export function createBot(token: string, dependencies: BotDependencies) {

    function contextConfigurator(context: BotContext<BotStateId, PayloadUnion>) {
        context.addState("main", new MainState(dependencies))

        const createDefModel = new CreateDefinitionModel({} as CreateDefinitionModelData);
        const createDefView = new TelegramCreateDefinitionView(context);
        const createDefPresenter = new CreateDefinitionsPresenter(createDefView, createDefModel, dependencies)
        context.addState("create-definition", new CreateDefinitionState(createDefPresenter));

        context.setState("main")
    }

    return new Bot<BotStateId, PayloadUnion>(token, contextConfigurator);
}