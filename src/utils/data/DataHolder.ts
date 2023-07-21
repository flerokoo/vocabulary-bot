import { Observable, Subscription } from './Observable';

export abstract class DataHolder<T> extends Observable<T> {

    constructor(private __data: T) {
        super();
    }

    public subscribe(callback: (x: T) => void): Subscription {
        return super.subscribe(callback);
    }

    public subscribeAndCall(callback: (x: T) => void) : Subscription {
        callback(this.__data);
        return this.subscribe(callback);
    }

    public get data(): T {
        return this.__data;
    }

    protected setState(newData: T): void {
        this.__data = newData;
        this.emit(newData);
    }
}