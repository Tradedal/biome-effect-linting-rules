import { Effect, FileSystem, Schema } from "effect";

const CatalogView = Schema.Struct({
  pageSize: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 100 })),
  showArchived: Schema.Boolean,
});

const SavedCatalogView = Schema.fromJsonString(CatalogView);

/**
 * The readCatalogView function puts its fallback outside the pipeline that
 * reads and decodes the file. The nested recovery call obscures which
 * failures return the default view.
 */
export const readCatalogView = Effect.fn("readCatalogView")(function* (
  filePath: string,
) {
  const fs = yield* FileSystem.FileSystem;

  return yield* Effect.catch(
    // It incorrectly puts the read/decode pipeline inside catch's first argument.
    fs
      .readFileString(filePath)
      .pipe(Effect.flatMap(Schema.decodeUnknownEffect(SavedCatalogView))),
    () =>
      Effect.succeed(CatalogView.make({ pageSize: 20, showArchived: false })),
  );
});
