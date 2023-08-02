export const delay = (ms : number) => {
  return <T>(x : T) : Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
};