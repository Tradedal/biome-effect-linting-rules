import { Effect, String as Str } from "effect";

interface SessionStore {
  readonly read: Effect.Effect<string>;
}

/**
 * loadSession correctly keeps the read and normalization in its named
 * Effect function. The pipeline defines the complete session query, so a
 * forwarding helper is unnecessary.
 */
export const loadSession = Effect.fn("loadSession")((store: SessionStore) =>
  // This pipeline correctly keeps the session read and trim inside loadSession.
  store.read.pipe(Effect.map(Str.trim)),
);
