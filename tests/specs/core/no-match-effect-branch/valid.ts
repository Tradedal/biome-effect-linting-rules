import { Console, Effect, FileSystem, Match, Option, Schema } from "effect";
import { Command } from "effect/cli";

const ReportRequest = Schema.Struct({
  format: Schema.Literals(["compact", "indented"]),
  report: Schema.Struct({ title: Schema.NonEmptyString, total: Schema.Finite }),
});
const CompactReport = Schema.fromJsonString(ReportRequest.fields.report);
const IndentedReport = Schema.fromJsonString(ReportRequest.fields.report, {
  space: 2,
});
const ReportReceipt = Schema.Struct({ filePath: Schema.NonEmptyString });

/**
 * exportReport writes a report in the requested JSON format and returns its
 * file path after the write succeeds. Match selects the encoder, then one
 * sequence encodes the report once and writes it. Input, encoding, and write
 * failures remain Effect failures; no receipt is returned after a failed write.
 */
export const exportReport = Effect.fn("exportReport")(function* (
  input: unknown,
  filePath: string,
) {
  const request = yield* Schema.decodeUnknownEffect(ReportRequest)(input);
  const fs = yield* FileSystem.FileSystem;

  // It correctly selects the encoder before the Effect sequence.
  const encodeReport = Match.value(request.format).pipe(
    Match.when("compact", () => Schema.encodeEffect(CompactReport)),
    Match.orElse(() => Schema.encodeEffect(IndentedReport)),
  );
  const contents = yield* encodeReport(request.report);

  yield* fs.writeFileString(filePath, contents);

  return ReportReceipt.make({ filePath });
});

/**
 * selectCommand selects a command definition. The preview command reads and
 * prints the report only when the CLI invokes its handler.
 */
export function selectCommand(preview: boolean) {
  // It correctly leaves the sequence inside the command handler.
  return Match.value(preview).pipe(
    Match.when(true, () =>
      Command.make("preview", {}, () =>
        FileSystem.FileSystem.pipe(
          Effect.flatMap((fs) => fs.readFileString("summary.txt")),
          Effect.flatMap(Console.log),
        ),
      ),
    ),
    Match.orElse(() =>
      Command.make("publish", {}, () => Console.log("Published")),
    ),
  );
}

/**
 * resolveValidatedTitle checks an explicit title or reads the title from a
 * book. It validates the chosen title once and passes open or validation
 * failures to the caller.
 */
export function resolveValidatedTitle(
  title: Option.Option<string>,
  openBook: () => Effect.Effect<{ readonly title: string }, Error>,
) {
  // It correctly validates the selected title after the branch.
  return Option.match(title, {
    onNone: () => openBook().pipe(Effect.map((book) => book.title)),
    onSome: Effect.succeed,
  }).pipe(Effect.flatMap(Schema.decodeUnknownEffect(Schema.NonEmptyString)));
}
