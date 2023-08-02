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
import { ILogger } from "../utils/ILogger";
import { ChatId } from "node-telegram-bot-api";
import { SelectLearnModeState, SelectLearnModeStatePayload } from "./states/SelectLearnModeState";
import { AssignTagsState, AssignTagsStatePayload } from "./states/AssignTagsState";
import { ITagRepository } from "../db/ITagRepository";
import { AssignTagsStateModel, AssignTagsStateModelData } from "./data/AssignTagsStateModel";
import { AssignTagsPresenter } from "./presenters/AssignTagsPresenter";
import { SelectLearnTagsState, SelectLearnTagsStatePayload } from "./states/SelectLearnTagsState";
import { SelectExportTagsState, SelectExportTagsStatePayload } from "./states/SelectExportTagsState";

export type PayloadUnion =
  | CreateDefinitionStatePayload
  | MainStatePayload
  | SelectLearnModeStatePayload
  | LearnStatePayload
  | ExportStatePayload
  | AssignTagsStatePayload
  | SelectLearnTagsStatePayload
  | SelectExportTagsStatePayload;

export type BotDependencies = {
  defProvider: IWordDefinitionProvider;
  wordRepo: IWordRepository;
  defRepo: IDefinitionRepository;
  userRepo: IUserRepository;
  tagRepo: ITagRepository;
  logger: ILogger;
};

const getContextConfigurator =
  (dependencies: BotDependencies) => async (context: BotContext<BotStateId, PayloadUnion>, chatId: ChatId) => {
    const user = await dependencies.userRepo.getOrAdd(chatId.toString());
    // todo replace manual DI with something

    // create definition state
    const createDefModel = new CreateDefinitionModel({} as CreateDefinitionModelData);
    const createDefPresenter = new CreateDefinitionsPresenter(createDefModel, dependencies);
    const createDefView = new CreateDefinitionState(user.id, createDefPresenter, dependencies.logger);
    createDefPresenter.attachView(createDefView);
    context.addState("create-definition", createDefView);

    // create learn state
    const learnModel = new LearnStateModel({} as LearnStateModelData);
    const learnPresenter = new LearnPresenter(learnModel, dependencies);
    const learnView = new LearnState(user.id, learnPresenter);
    learnPresenter.attachView(learnView);
    context.addState("learn", learnView);
    // create assign tags state
    const assignTagsModel = new AssignTagsStateModel({} as AssignTagsStateModelData);
    const assignTagsPresenter = new AssignTagsPresenter(assignTagsModel, dependencies);
    const assignTagsView = new AssignTagsState(user.id, assignTagsPresenter, dependencies);
    assignTagsPresenter.attachView(assignTagsView);
    context.addState("assign-tags", assignTagsView);

    //other states
    context.addState("select-learn-mode", new SelectLearnModeState(user.id));
    context.addState("select-learn-tags", new SelectLearnTagsState(user.id, dependencies.tagRepo));
    context.addState("main", new MainState(user.id, dependencies));
    context.addState("export", new ExportState(user.id, dependencies));
    context.addState("select-export-tags", new SelectExportTagsState(user.id, dependencies.tagRepo));

    // set initial state
    context.setState("main");

    dependencies.logger.log(`Created context for user`, user);
  };

export function createBot(token: string, dependencies: BotDependencies) {
  const bot = new Bot<BotStateId, PayloadUnion>(token, getContextConfigurator(dependencies));
  bot.addListener("error", (err) => dependencies.logger.error(err));
  bot.addListener("polling_error", (err) => dependencies.logger.error(err));
  return bot;
}
