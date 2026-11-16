import { Effect, Ref } from "effect";

/**
 * The generator correctly puts the delivery log before the state update.
 * Separate yields express the required order directly, without a collection
 * of unused action results.
 */
export const markDelivered = Effect.fn("markDelivered")(function* (
  delivered: Ref.Ref<boolean>,
  recipient: string,
) {
  yield* Effect.logInfo(`Parcel delivered to ${recipient}`);
  // It correctly yields the state update separately after the log.
  yield* Ref.set(delivered, true);
  return yield* Ref.get(delivered);
});
