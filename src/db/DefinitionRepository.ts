import {Database} from "sqlite3";
import {IDefinitionRepository} from "../usecases/IDefinitionRepository";
import {IMeaning} from "../usecases/entities/IMeaning";

export class DefinitionRepository implements IDefinitionRepository {

    constructor(private readonly db: Database) {

    }

    add(wordId: number, userId: string, definition: string, example?: string): Promise<void> {
        return new Promise((resolve, _) => {
            const callback = (result: any, err: any) => {
                if (err) throw new Error()
                resolve()
            };
            const query = `INSERT INTO Definitions (word, definition, example, userId) VALUES (?, ?, ?, ?)`;
            this.db.run(query, [wordId, definition, example, userId], callback)
        });
    }

    getAll(userId: string): Promise<IMeaning[]> {
        return new Promise((resolve, _) => {
            const callback = (err: any, result: any) => {
                if (err) throw new Error()
                resolve(result as IMeaning[])
            };
            const query = `SELECT * FROM Definitions WHERE userId=${userId}`;
            this.db.all(query, callback)
        });
    }

    getByWordId(wordId: number, userId: string): Promise<IMeaning[]> {
        return new Promise((resolve, _) => {
            const callback = (err: any, result: any) => {
                if (err) throw new Error()
                console.log(result)
                resolve(result as IMeaning[])
            };
            const query = `SELECT * FROM Definitions WHERE userId=${userId} AND word=${wordId}`;
            this.db.all(query, callback)
        });
    }

    getByWord(word: string, userId: string): Promise<IMeaning[]> {
        return Promise.resolve([]);
    }

    //
    // add(word: string, userId: string): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         const callback = (result: any, err: any) => {
    //             if (err) throw new Error()
    //             resolve()
    //         };
    //         const query = `INSERT INTO Words (word, userId) VALUES (?, ?)`;
    //         this.db.run(query, [word, userId], callback)
    //     });
    // }
    //
    // getAll(userId: string): Promise<IWord[]> {
    //     return new Promise((resolve, reject) => {
    //         const callback = (err: any, result: any) => {
    //             if (err) throw new Error()
    //             resolve(result)
    //         };
    //         const query = `SELECT * FROM Words WHERE userId='${userId}'`;
    //         this.db.all(query, callback)
    //     });
    // }

}