import { Effect } from "effect";
import { Atom } from "effect/reactivity";

export const counter = Atom.make(0);

/**
 * increment must add one to the shared counter when its Effect runs.
 * Effect.sync instead succeeds with the unexecuted Atom.update Effect, so the
 * caller can run the wrapper without changing the count.
 */
export const increment = Effect.sync(() =>
  // It incorrectly wraps the atom update in Effect.sync.
  Atom.update(counter, (count) => count + 1),
);
