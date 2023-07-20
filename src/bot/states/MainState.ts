import {AbstractState} from "./AbstractState";
import TelegramBot from "node-telegram-bot-api";
import {BotContext} from "../BotContext";
import {sanitize} from "../../utils/sanitize";
import {BotStateId} from "./BotStateId";


const commands: { [key: string]: Function } = {
    "/start": <_>(c: BotContext<string, _>) => c.sendMessage("/start message reply!")
}

export class MainState extends AbstractState<BotStateId, {}> {

    enter(payload: {}) {
    }

    exit() {
    }

    handleMessage(message: TelegramBot.Message) {
        if (!message.text) return;

        if (message.text?.startsWith("/")) {
            this.handleCommand(message.text.toLowerCase(), message);
            return;
        }

        const word = sanitize(message.text);
        this.context.setState("create-definition", {word})
    }

    private handleCommand(command: string, message: TelegramBot.Message) {
        if (!(command in commands))
            return;

        commands[command](this.context)
    }

    handleCallbackQuery(query: TelegramBot.CallbackQuery): void {
    }

}