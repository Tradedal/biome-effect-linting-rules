import { Effect, FileSystem, Schema } from "effect";

const Configuration = Schema.fromJsonString(
  Schema.Struct({ endpoint: Schema.NonEmptyString }),
);

/**
 * loadEndpoint reads a configuration file and returns its endpoint. The
 * generator obtains the filesystem before the read pipeline begins. That
 * pipeline retries the read twice before decoding, so a malformed configuration
 * fails without another file read.
 */
export const loadEndpoint = Effect.fn("loadEndpoint")(function* (path: string) {
  const fs = yield* FileSystem.FileSystem;

  // It correctly puts retry before decoding and endpoint selection in one pipeline.
  return yield* fs.readFileString(path).pipe(
    Effect.retry({ times: 2 }),
    Effect.flatMap(Schema.decodeUnknownEffect(Configuration)),
    Effect.map((configuration) => configuration.endpoint),
  );
});
