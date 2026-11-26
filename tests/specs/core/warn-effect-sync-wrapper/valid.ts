import { Effect, Ref } from "effect";

/**
 * increment adds one to the supplied counter and returns its new value.
 * Ref.updateAndGet performs the atomic transition when the Effect runs.
 */
export const increment = Effect.fn("increment")((counter: Ref.Ref<number>) =>
  // It correctly returns Ref.updateAndGet directly.
  Ref.updateAndGet(counter, (count) => count + 1),
);
