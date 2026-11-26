import { Effect, Ref } from "effect";

/**
 * increment adds one to the supplied counter. Effect.sync returns the update
 * Effect as a value, so a caller can run increment without changing the count.
 * Ref.updateAndGet already supplies the executable update and its new value.
 */
export const increment = Effect.fn("increment")((counter: Ref.Ref<number>) =>
  // It incorrectly wraps Ref.updateAndGet in Effect.sync.
  Effect.sync(() => Ref.updateAndGet(counter, (count) => count + 1)),
);
