import { AbstractState } from "./AbstractState";
import TelegramBot from "node-telegram-bot-api";
import { BotStateId } from "./BotStateId";
import { PayloadUnion } from "../create-bot";
import { ICreateDefinitionPresenter } from "../presenters/ICreateDefinitionPresenter";

export const CONTINUE_QUERY_DATA = "continue";

export type CreateDefinitionStatePayload = {
  readonly word: string;
  readonly isNewWord: boolean;
};

export class CreateDefinitionState extends AbstractState<
  BotStateId,
  CreateDefinitionStatePayload,
  PayloadUnion
> {
  constructor(private presenter: ICreateDefinitionPresenter) {
    super();
  }

  async enter(payload: CreateDefinitionStatePayload) {
    this.presenter.onShow(payload, this.context.chatId.toString());
  }

  exit() {
    this.presenter.reset();
  }

  async handleMessage(message: TelegramBot.Message) {
    if (!message.text) return;
    if (message.text.length === 0) return;
    this.presenter.addDefinition(message.text);
  }

  async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    if (query.data === CONTINUE_QUERY_DATA) {
      await this.presenter.onContinue();
      this.context.setState("main");
      return;
    }

    this.presenter.toggleDefinitionUsage(query.data);
  }
}
