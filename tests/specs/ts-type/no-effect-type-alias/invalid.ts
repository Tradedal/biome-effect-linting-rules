import { type Effect, Ref } from "effect";

/**
 * readCount returns the current counter value when its Effect runs.
 * The ReadCount alias separates its channels from the operation that defines
 * them, so the reader must inspect both declarations to follow the contract.
 */
type ReadCount =
  // It incorrectly declares the implemented channels in a separate alias.
  (counter: Ref.Ref<number>) => Effect.Effect<number>;
export const readCount: ReadCount = (counter) => Ref.get(counter);
