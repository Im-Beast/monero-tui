type Object = { [key in string | number | symbol]: unknown };
type AwaitedObject<T extends Object> = { [key in keyof T]: Awaited<T[key]> };
type PromisedObject<T extends Object> = {
  [key in keyof T]: T[key] extends Promise<infer _> ? T[key] : Promise<T[key]>;
};

export async function PromiseAllObject<const T extends Object>(object: PromisedObject<T>): Promise<AwaitedObject<T>> {
  const awaitedValues = await Promise.all(Object.values(object));
  const awaitedObject = object as AwaitedObject<T>;
  for (const key in object) {
    // deno-lint-ignore no-explicit-any
    awaitedObject[key] = awaitedValues.shift()! as any;
  }
  return awaitedObject;
}
