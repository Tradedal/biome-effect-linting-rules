import { Context, Duration, Effect, Layer, Match, Schema } from "effect";
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

/**
 * makeFixtureCases shares a computed title between two cases. Each case can
 * read the same concrete value without rerunning its setup Effect.
 */
export function makeFixtureCases() {
  // It correctly keeps the evaluated value for both cases.
  const title: string = Effect.runSync(Effect.succeed("Field guide"));

  return [
    { title, format: "paper" },
    { title, format: "digital" },
  ];
}

/**
 * readFixedCatalogTitle supplies a catalog with a fixed title. The read
 * uses the complete Layer to supply its catalog dependency.
 */
export function readFixedCatalogTitle() {
  // It correctly stores the completed Layer after the unwrap step.
  const catalog = Effect.succeed(
    Layer.succeed(CatalogStore, { title: "Field guide" }),
  ).pipe(Layer.unwrap);

  return Effect.provide(CatalogStore, catalog).pipe(
    Effect.map(({ title }) => title),
  );
}

class CatalogStore extends Context.Service<
  CatalogStore,
  { readonly title: string }
>()("example/CatalogStore") {}

class CatalogSettings extends Context.Service<
  CatalogSettings,
  { readonly title: string }
>()("example/CatalogSettings") {}

/**
 * readConfiguredCatalogTitle gets the title from a catalog service that
 * derives its value from settings. The same graph supplies both services.
 */
export function readConfiguredCatalogTitle(title: string) {
  // It correctly stores the complete graph after provision.
  const catalog = Layer.unwrap(
    Effect.map(CatalogSettings, ({ title }) =>
      Layer.succeed(CatalogStore, { title }),
    ),
  ).pipe(Layer.provideMerge(Layer.succeed(CatalogSettings, { title })));

  return Effect.provide(CatalogStore, catalog).pipe(
    Effect.map(({ title }) => title),
  );
}
