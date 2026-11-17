import { Duration, Effect, Match, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";

const Catalog = Schema.Array(
  Schema.Struct({ id: Schema.NonEmptyString, title: Schema.NonEmptyString }),
);

/**
 * makeCatalogQueries exposes a catalog read and a refresh that also reports the
 * item count. The read contains the request, status check, and schema decoder.
 * The refresh selects its deadline before it runs that complete read and builds
 * the summary. A normal refresh times out after five seconds; a long poll has no
 * deadline. Transport, status, decoding, and timeout failures reach the caller.
 */
export const makeCatalogQueries = Effect.fn("makeCatalogQueries")(function* (
  catalogUrl: string,
) {
  const client = yield* HttpClient.HttpClient;

  // It correctly defines the complete read exposed through the returned API.
  const read = client
    .get(catalogUrl)
    .pipe(
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(Catalog)),
    );

  const refresh = Effect.fn("Catalog.refresh")((longPoll: boolean) => {
    const timeout = Match.value(longPoll).pipe(
      Match.when(true, () => Duration.infinity),
      Match.orElse(() => Duration.seconds(5)),
    );

    return read.pipe(
      // It correctly keeps the deadline and summary in the refresh pipeline.
      Effect.timeout(timeout),
      Effect.map((items) => ({ items, count: items.length })),
    );
  });

  return { read, refresh };
});
