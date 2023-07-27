import { formatFilename } from "./format-filename";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const anki = require("anki-apkg-export");

export async function exportAnkiDeck(data: { word: string, meanings: string[] }[]) {
  const deck = new anki.default("My Dictionary");
  for (const datum of data) {
    deck.addCard(datum.word, datum.meanings.join("<br/><br/>"));
  }
  const pack = await deck.save();
  return {
    data: pack,
    filename: formatFilename("AnkiDeck", "apkg")
  };
}