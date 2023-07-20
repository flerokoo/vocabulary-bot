import sqlite from 'sqlite3'
import fsp from 'node:fs/promises'
import {WordRepository} from "./WordRepository";
import {DefinitionRepository} from "./DefinitionRepository";


export async function initDb() {
    let db = new sqlite.Database("./db.sqlite")
    let query = await fsp.readFile("./install/install-db.sql", "utf-8")

    await new Promise<void>((resolve, reject) => db.exec(query, (err: any) => {
        if (err) return reject(err)
        resolve();
    }));

    const wordRepository = new WordRepository(db);
    const defRepository = new DefinitionRepository(db);
    return {wordRepository, defRepository}
}