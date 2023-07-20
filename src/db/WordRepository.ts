import {IWordRepository} from "../usecases/IWordRepository";
import {IWord} from "../entities/IWord";
import {Database, RunResult} from "sqlite3";

export class WordRepository implements IWordRepository {

    constructor(private readonly db: Database) {

    }

    add(word: string, userId: string): Promise<number> {
        let {db} = this;
        return new Promise((resolve, reject) => {
            function callback(this: RunResult, result: any, err: any) {
                if (err) throw new Error()
                resolve(this.lastID)
            }

            const query = `INSERT INTO Words (word, userId) VALUES (?, ?)`;
            db.run(query, [word, userId], callback)
        });
    }

    getAll(userId: string): Promise<IWord[]> {
        return new Promise((resolve, reject) => {
            const callback = (err: any, result: any) => {
                if (err) throw new Error()
                resolve(result as IWord[])
            };
            const query = `SELECT * FROM Words WHERE userId='${userId}'`;
            this.db.all(query, callback)
        });
    }

}