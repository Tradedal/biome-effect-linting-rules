import { randomUUID } from "node:crypto";

import { Data, Effect, FileSystem, Option, Schema } from "effect";

const ReminderRequest = Schema.Struct({
  recipient: Schema.NonEmptyString,
  // It correctly defines the enabled default in its schema.
  enabled: Schema.Boolean.pipe(
    Schema.withDecodingDefault(Effect.succeed(false)),
  ),
});

const QueuedReminder = Schema.fromJsonString(
  Schema.Struct({ recipient: Schema.NonEmptyString }),
);

type ReminderOutcome = Data.TaggedEnum<{
  Scheduled: { readonly recipient: string; readonly notificationId: string };
  Disabled: { readonly recipient: string };
}>;
const ReminderOutcome = Data.taggedEnum<ReminderOutcome>();

/**
 * The reminder request correctly supplies its false default during decoding.
 * Only an explicitly enabled request creates a notification file, and its
 * outcome includes the id of that queued notification.
 */
export const scheduleReminder = Effect.fn("scheduleReminder")(function* (
  input: unknown,
  queueDirectory: string,
) {
  const request = yield* Schema.decodeUnknownEffect(ReminderRequest)(input);

  const fs = yield* FileSystem.FileSystem;

  const notificationId = yield* Effect.sync(randomUUID);

  const contents = yield* Schema.encodeEffect(QueuedReminder)({
    recipient: request.recipient,
  });

  const queued = yield* fs
    .makeDirectory(queueDirectory, { recursive: true })
    .pipe(
      Effect.andThen(() =>
        fs.writeFileString(
          `${queueDirectory}/${notificationId}.json`,
          contents,
          { flag: "wx" },
        ),
      ),
      Effect.when(Effect.succeed(request.enabled)),
    );

  return Option.match(queued, {
    onSome: () =>
      ReminderOutcome.Scheduled({
        recipient: request.recipient,
        notificationId,
      }),
    onNone: () => ReminderOutcome.Disabled({ recipient: request.recipient }),
  });
});
