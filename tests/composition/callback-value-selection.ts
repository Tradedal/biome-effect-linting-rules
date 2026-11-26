import { Effect, Match } from "effect";

/**
 * label converts an enabled flag inside an Effect to 1 or 0. Match selects the
 * number within the map callback, so the nested pipeline has its own input.
 */
export const label = Effect.succeed(true).pipe(
  Effect.map((enabled) =>
    // It correctly selects a pure value inside the Effect.map callback.
    Match.value(enabled).pipe(
      Match.when(true, () => 1),
      Match.orElse(() => 0),
    ),
  ),
);
