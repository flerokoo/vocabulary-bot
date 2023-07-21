import {IWordRepository} from "../usecases/IWordRepository";
import {IWord} from "../usecases/entities/IWord";
import {Database, RunResult} from "sqlite3";

export class WordRepository implements IWordRepository {

    constructor(private readonly db: Database) {

    }

    add(word: string, userId: string): Promise<number> {
        let {db} = this;
        return new Promise((resolve, _) => {
            function callback(this: RunResult, result: any, err: any) {
                if (err) throw new Error()
                resolve(this.lastID)
            }

            const query = `INSERT INTO Words (word, userId) VALUES (?, ?)`;
            db.run(query, [word, userId], callback)
        });
    }

    getByText(word: string, userId: string): Promise<IWord | null> {
        return new Promise((resolve, _) => {
            const callback = (err: any, result: any) => {
                if (err) throw new Error()
                if (Array.isArray(result) && result.length > 0)
                    resolve(result[0] as IWord)
                else
                    resolve(null);
            };
            const query = `SELECT * FROM Words WHERE userId='${userId}' AND word='${word}' LIMIT 1`;
            this.db.all(query, callback)
        });
    }

    getAll(userId: string): Promise<IWord[]> {
        return new Promise((resolve, _) => {
            const callback = (err: any, result: any) => {
                if (err) throw new Error()
                resolve(result as IWord[])
            };
            const query = `SELECT * FROM Words WHERE userId='${userId}'`;
            this.db.all(query, callback)
        });
    }

}