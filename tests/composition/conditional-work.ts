import { Effect } from "effect";

export interface Writer {
  readonly write: Effect.Effect<void, Error>;
}

/**
 * writeWhen runs the supplied write only when enabled is true. A skipped write
 * succeeds with void, and a failed write remains a failure for its caller.
 */
export const writeWhen = Effect.fn("writeWhen")(
  (enabled: boolean, writer: Writer) =>
    // It correctly applies the condition to the write Effect.
    writer.write.pipe(Effect.when(Effect.succeed(enabled)), Effect.asVoid),
);
