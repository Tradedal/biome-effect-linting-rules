import { Array as Arr, Effect, Option, Schema } from "effect";

const DownloadAccess = Schema.Struct({
  permissions: Schema.Array(Schema.String),
  downloadUrl: Schema.NonEmptyString,
});

const DownloadLink = Schema.Struct({ url: Schema.NonEmptyString });

/**
 * resolveDownload returns a link only when the decoded access permits downloads.
 * Option.liftPredicate applies that permission check to the constructed link.
 * A missing permission returns None, and malformed access fails decoding.
 */
export const resolveDownload = Effect.fn("resolveDownload")(function* (
  input: unknown,
) {
  const access = yield* Schema.decodeUnknownEffect(DownloadAccess)(input);
  const link = DownloadLink.make({ url: access.downloadUrl });

  // It correctly retains the link only when the download permission is present.
  return Option.liftPredicate(link, () =>
    Arr.contains(access.permissions, "download"),
  );
});
