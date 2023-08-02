
export interface AsyncGetter<T> {
  get isReady(): boolean;
  getValue() : Promise<T>;
}

export const createAsyncGetter = <T>(getter: () => Promise<T>) : AsyncGetter<T> => {
  let ready = false;
  let value: T | undefined = undefined;
  let promise: Promise<T>;

  const internalGetter = () => {
    promise = getter();
    promise.then(v => {
      value = v;
      ready = true;
      return v;
    })
    return promise;
  };

  return {
    get isReady() {
      return ready;
    },
    getValue() {
      if (ready) return Promise.resolve(value as T);
      if (promise) return promise;
      return internalGetter();
    }
  };
};
