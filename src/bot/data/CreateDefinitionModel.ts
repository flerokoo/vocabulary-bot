import {DataHolder} from "../../utils/data/DataHolder";
import {IMeaning} from "../../usecases/entities/IMeaning";

export type CreateDefinitionStateMeaning = IMeaning & { use: boolean };
export type CreateDefinitionModelData = { meanings: CreateDefinitionStateMeaning[], word: string, userId: string }


export class CreateDefinitionModel extends DataHolder<CreateDefinitionModelData> {

    setDefinitions(meanings: IMeaning[]) {
        const newMeanings = meanings.map(m => ({
            ...m,
            use: false
        }));
        this.setState({...this.data, meanings: newMeanings});
    }

    addDefinition(meaning: IMeaning) {
        const newMeanings = this.data.meanings.map(m => ({...m}));
        newMeanings.push({...meaning, use: false});
        this.setState({...this.data, meanings: newMeanings});
    }

    setWord(word: string) {
        this.setState({...this.data, word})
    }

    setUserId(userId: string) {
        this.setState({...this.data, userId});
    }

    toggleDefinitionUsage(i: number) {
        if (isNaN(i)) return;
        if (i < 0 || i >= this.data.meanings.length) return;
        const obj = this.data.meanings[i];
        obj.use = !obj.use;
        this.setState(this.data);
    }
}