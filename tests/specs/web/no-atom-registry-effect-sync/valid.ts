import { Atom } from "effect/reactivity";

export const counter = Atom.make(0);

/**
 * increment adds one to the shared counter when the caller runs its Effect
 * with the AtomRegistry service. The update runs through that registry and
 * completes with void.
 */
export const increment =
  // It correctly returns the Atom.update Effect directly.
  Atom.update(counter, (count) => count + 1);
