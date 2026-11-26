import { Effect, Ref } from "effect";

/**
 * readCounter returns the current counter value when its Effect runs.
 * Its explicit return annotation duplicates the channels determined by Ref.get.
 */
export const readCounter = Effect.fn("readCounter")(
  // It incorrectly annotates channels already inferred from Ref.get.
  (counter: Ref.Ref<number>): Effect.Effect<number> => Ref.get(counter),
);
