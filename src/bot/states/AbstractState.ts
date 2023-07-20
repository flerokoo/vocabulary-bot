import TelegramBot from "node-telegram-bot-api";
import {Bot} from "../Bot";
import {BotContext} from "../BotContext";

export abstract class AbstractState<TStateKey extends string, TPayload> {
    context!: BotContext<TStateKey, TPayload>

    constructor() {
    }

    abstract enter(payload: TPayload): void;

    abstract handleMessage(message: TelegramBot.Message): void;

    abstract handleCallbackQuery(query: TelegramBot.CallbackQuery): void;

    abstract exit(): void;
}

