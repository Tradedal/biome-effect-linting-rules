import { Array as Arr, Effect, Option, Schema } from "effect";

const DownloadAccess = Schema.Struct({
  permissions: Schema.Array(Schema.String),
  downloadUrl: Schema.NonEmptyString,
});

const DownloadLink = Schema.Struct({ url: Schema.NonEmptyString });

/**
 * resolveDownload returns a link only when the decoded access permits downloads.
 * It finds a permission string just to replace it with the link. The preset
 * prohibits Option.as; Option.liftPredicate can check access on the link itself.
 */
export const resolveDownload = Effect.fn("resolveDownload")(function* (
  input: unknown,
) {
  const access = yield* Schema.decodeUnknownEffect(DownloadAccess)(input);
  const link = DownloadLink.make({ url: access.downloadUrl });

  return Arr.findFirst(
    access.permissions,
    (permission) => permission === "download",
  ).pipe(
    // It incorrectly passes the link directly to Option.as.
    Option.as(link),
  );
});
