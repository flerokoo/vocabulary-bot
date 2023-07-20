import {Bot, BotDependencies} from "./Bot";
import {BotStateId} from "./states/BotStateId";
import {MainState} from "./states/MainState";
import {CreateDefinitionState, CreateDefinitionStatePayload} from "./states/CreateDefinitionState";
import IWordDefinitionProvider from "../usecases/IWordDefinitionProvider";
import {BotContext} from "./BotContext";

type PayloadUnion = CreateDefinitionStatePayload | string;


export function createBot(token: string, dependencies: BotDependencies) {

    function contextConfigurator(context: BotContext<BotStateId, PayloadUnion>) {
        context.addState("main", new MainState())
        context.addState("create-definition", new CreateDefinitionState(
            dependencies.defProvider
        ))
        context.setState("main")
    }

    const bot = new Bot<BotStateId, PayloadUnion>(token, contextConfigurator);
}