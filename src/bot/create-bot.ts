import { Bot } from "./Bot";
import { BotStateId } from "./states/BotStateId";
import { MainState, MainStatePayload } from "./states/MainState";
import { CreateDefinitionState, CreateDefinitionStatePayload } from "./states/CreateDefinitionState";
import IWordDefinitionProvider from "../utils/IWordDefinitionProvider";
import { BotContext } from "./BotContext";
import { IWordRepository } from "../db/IWordRepository";
import { IDefinitionRepository } from "../db/IDefinitionRepository";
import { CreateDefinitionsPresenter } from "./presenters/CreateDefinitionsPresenter";
import { CreateDefinitionModel, CreateDefinitionModelData } from "./data/CreateDefinitionModel";
import { ExportState, ExportStatePayload } from "./states/ExportState";
import { IUserRepository } from "../db/IUserRepository";
import { LearnState, LearnStatePayload } from "./states/LearnState";
import { LearnStateModel, LearnStateModelData } from "./data/LearnStateModel";
import { LearnPresenter } from "./presenters/LearnPresenter";

export type PayloadUnion = CreateDefinitionStatePayload | MainStatePayload
  | LearnStatePayload | ExportStatePayload;

export type BotDependencies = {
  defProvider: IWordDefinitionProvider;
  wordRepo: IWordRepository;
  defRepo: IDefinitionRepository;
  userRepo: IUserRepository
};

// todo replace manual DI with something
export function createBot(token: string, dependencies: BotDependencies) {
  function contextConfigurator(context: BotContext<BotStateId, PayloadUnion>) {
    context.addState("main", new MainState(dependencies));
    context.addState("export", new ExportState(dependencies));
    // create definition state
    const createDefModel = new CreateDefinitionModel({} as CreateDefinitionModelData);
    const createDefPresenter = new CreateDefinitionsPresenter(createDefModel, dependencies);
    const createDefView = new CreateDefinitionState(createDefPresenter);
    createDefPresenter.attachView(createDefView);
    context.addState("create-definition", createDefView);
    // create learn state
    const learnModel = new LearnStateModel({} as LearnStateModelData);
    const learnPresenter = new LearnPresenter(learnModel, dependencies);
    const learnView = new LearnState(learnPresenter);
    learnPresenter.attachView(learnView);
    context.addState("learn", learnView);
    context.setState("main");
  }

  return new Bot<BotStateId, PayloadUnion>(token, contextConfigurator);
}
