import {NO_WORD} from "../error-messages";
import {IMeaning} from "../usecases/entities/IMeaning";

type DictApiDefinition = {
    definition: string,
    example: string
}

type DictApiResponse = {
    meanings: {
        partOfSpeech: string,
        definitions: DictApiDefinition[]
    }[]
}[]

function getUrl(word: string) {
    return `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
}

function isCorrectResponse(obj: unknown): obj is DictApiResponse {
    if (!Array.isArray(obj) || obj.length === 0) return false;
    if (!("meanings" in obj)) return false;
    return Array.isArray(obj["meanings"]);

}

export default async function getFromDictionaryApi(word: string) {
    const url = getUrl(word)
    const response = await fetch(url);
    const json: unknown = await response.json()

    if (isCorrectResponse(json))
        throw new Error(NO_WORD);

    const checked = json as DictApiResponse;


    const meanings : IMeaning[] = [];
    for (const el of checked) {
        for (const meaning of el.meanings) {
            for (const def of meaning.definitions) {
                meanings.push({
                    definition: `[${meaning.partOfSpeech}] ${def.definition}`
                })
            }
        }
    }

    return meanings
}