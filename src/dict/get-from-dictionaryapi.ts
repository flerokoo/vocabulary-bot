import { IMeaning } from "../entities/IMeaning";

type DictApiDefinition = {
  definition: string;
  example: string;
};

type DictApiResponse = {
  meanings: {
    partOfSpeech: string;
    definitions: DictApiDefinition[];
  }[];
}[];

function getUrl(word: string) {
  return `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
}

function isCorrectResponse(obj: unknown): obj is DictApiResponse {
  if (!Array.isArray(obj) || obj.length === 0) return false;
  if (!("meanings" in obj[0])) return false;
  return Array.isArray(obj[0]["meanings"]);
}

export default async function getFromDictionaryApi(word: string) {
  const url = getUrl(word);
  const response = await fetch(url);
  const json: unknown = await response.json();
  if (!isCorrectResponse(json)) return [];

  const meanings: IMeaning[] = [];
  for (const el of json) {
    for (const meaning of el.meanings) {
      for (const def of meaning.definitions) {
        meanings.push({
          definition: `(${meaning.partOfSpeech}) ${def.definition}`,
        });
      }
    }
  }

  return meanings;
}
