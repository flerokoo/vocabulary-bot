
declare class AnkiPkg {
  constructor(deckName:string);
  addCard(front : string, back : string);
  addMedia(name:string, data:Buffer);
  save() : Promise<Buffer>
}

declare module "anki-apkg-export" {
  export = AnkiPkg;
}