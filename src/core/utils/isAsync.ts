export const isAsync = (fn: Function) => {
  return fn.constructor.name === 'AsyncFunction';
}