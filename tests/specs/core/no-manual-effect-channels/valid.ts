import { Effect, Ref } from "effect";

/**
 * readCounter returns the current counter value when its Effect runs.
 * Its return type follows the operation without a separate channel annotation.
 */
export const readCounter = Effect.fn("readCounter")(
  (counter: Ref.Ref<number>) =>
    // It correctly infers the channels from the returned operation.
    Ref.get(counter),
);
