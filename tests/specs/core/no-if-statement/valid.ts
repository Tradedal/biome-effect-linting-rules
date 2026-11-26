import { Effect, Match } from "effect";

/**
 * selectLabel returns "Enabled" when enabled is true and "Disabled" otherwise.
 * Match selects both alternatives in one expression, as the preset requires.
 */
export const selectLabel = (enabled: boolean) =>
  // It correctly uses Match.value for conditional value selection.
  Match.value(enabled).pipe(
    Match.when(true, () => "Enabled"),
    Match.orElse(() => "Disabled"),
  );

/**
 * logWhenEnabled logs "Enabled" once when enabled is true and skips it otherwise.
 * Effect.when attaches the condition to the log Effect, as the preset requires.
 */
export const logWhenEnabled = Effect.fn("logWhenEnabled")((enabled: boolean) =>
  // It correctly applies Effect.when to the log and discards its optional result.
  Effect.logInfo("Enabled").pipe(
    Effect.when(Effect.succeed(enabled)),
    Effect.asVoid,
  ),
);
