export const reportAsyncRejection = (target: any, key: string, descriptor: PropertyDescriptor) => {
  if (typeof descriptor?.value !== "function") throw new Error("Only function can be decorated");
  const fn = descriptor.value;

  descriptor.value = async function(this: any, ...args: any[]) {
    try {
      const result = await fn.bind(this)(...args);
      return result;
    } catch (error) {
      console.error(error);
      throw new Error(`Error during async operation ${key}`);
    }
  };
};