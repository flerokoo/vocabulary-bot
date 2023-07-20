import {AbstractState} from "./AbstractState";
import TelegramBot, {EditMessageTextOptions} from "node-telegram-bot-api";
import IWordDefinitionProvider from "../../usecases/IWordDefinitionProvider";
import {BotStateId} from "./BotStateId";

export type CreateDefinitionStatePayload = {
    readonly word: string
}

interface ICreateDefinitionController {

}

interface ICreateDefinitionView {

}

interface ICreateDefinitionPresenter {

}

let aa = 0;
let bb = 0;

export class CreateDefinitionState extends AbstractState<BotStateId, CreateDefinitionStatePayload> {

    message! : TelegramBot.Message;

    constructor(
        private defProvider: IWordDefinitionProvider
    ) {
        super();
    }

    async enter(payload: CreateDefinitionStatePayload) {
        const loader = await this.context.sendMessage("Retrieving definitions...")
        const meanings = await this.defProvider(payload.word)
        await this.context.deleteMessage(loader.chat.id, loader.message_id)
        this.message = await this.context.sendMessage(meanings[0].definition, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: aa.toString(),
                            callback_data: "1"
                        },
                        {
                            text: bb.toString(),
                            callback_data: "2"
                        }
                    ]
                ]
            }
        })
    }

    exit() {
    }

    async handleMessage(message: TelegramBot.Message) {
        this.context.sendMessage("What")
    }

    handleCallbackQuery(query: TelegramBot.CallbackQuery): void {
        if (query.data == "1") {
            aa ++
        } else {
            bb++;
        }


        this.context.editMessageReplyMarkup({
            inline_keyboard: [
                [
                    {
                        text: aa.toString(),
                        callback_data: "1"
                    },
                    {
                        text: bb.toString(),
                        callback_data: "2"
                    }
                ]
            ]
        }, {
            message_id: this.message.message_id
        })
    }

}