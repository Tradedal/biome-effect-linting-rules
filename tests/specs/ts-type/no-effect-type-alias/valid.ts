import { Effect, Ref } from "effect";

/**
 * readCount returns the current counter value when its Effect runs.
 * Its implementation determines the channels without a separate type alias.
 */
export const readCount = Effect.fn("readCount")((counter: Ref.Ref<number>) =>
  // It correctly infers the channels from the returned operation.
  Ref.get(counter),
);
