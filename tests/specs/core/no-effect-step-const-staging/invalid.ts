import { Duration, Effect, Match, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";

const Catalog = Schema.Array(
  Schema.Struct({ id: Schema.NonEmptyString, title: Schema.NonEmptyString }),
);

/**
 * makeCatalogQueries exposes a catalog read and a refresh that also reports the
 * item count. A normal refresh times out after five seconds; a long poll has no
 * deadline. The constructor stages the request before decoding, and refresh
 * stages the timed read before the summary. The preset requires each complete
 * operation to keep those dependent steps together.
 */
export const makeCatalogQueries = Effect.fn("makeCatalogQueries")(function* (
  catalogUrl: string,
) {
  const client = yield* HttpClient.HttpClient;

  // It incorrectly stages the request before the catalog decoder.
  const request = client
    .get(catalogUrl)
    .pipe(Effect.flatMap(HttpClientResponse.filterStatusOk));
  const read = request.pipe(
    Effect.flatMap(HttpClientResponse.schemaBodyJson(Catalog)),
  );

  const refresh = Effect.fn("Catalog.refresh")(function* (longPoll: boolean) {
    const timeout = Match.value(longPoll).pipe(
      Match.when(true, () => Duration.infinity),
      Match.orElse(() => Duration.seconds(5)),
    );

    // It incorrectly stages the timed read before the summary.
    const timed = read.pipe(Effect.timeout(timeout));
    const summarized = timed.pipe(
      Effect.map((items) => ({ items, count: items.length })),
    );

    return yield* summarized;
  });

  return { read, refresh };
});
