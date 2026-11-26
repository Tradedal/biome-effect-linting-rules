import {
  Context,
  type Duration,
  Effect,
  flow,
  Layer,
  Ref,
  Schedule,
} from "effect";

/**
 * A badge kiosk starts a session with the ID from its card reader. Each session
 * keeps its own selection. When the operator requests a badge, the kiosk looks
 * up the selected ID and gives the display the outcome, including any failure.
 * See {@link Layer.fresh} for session isolation and {@link Effect.retry} and
 * {@link Schedule.upTo} for the directory's retry policy.
 * Compare the [same kiosk with inferred channels](./valid.ts).
 */
class Selection extends Context.Service<Selection, Ref.Ref<string>>()(
  "example/Selection",
) {}

type Badge = { readonly displayName: string };
type LookupFailure =
  | { readonly _tag: "Busy" }
  | { readonly _tag: "UnknownBadge" };

/** A card can move during a scan. Give the reader one more attempt if it throws. */
const retryOnce = <Value, Failure, Services>(
  // This wrapper repeats the input signature of Effect.retry.
  work: Effect.Effect<Value, Failure, Services>,
) => work.pipe(Effect.retry({ times: 1 }));

const scanCard = (read: () => string) =>
  retryOnce(Effect.try({ try: read, catch: () => "Unreadable card" }));

/** Two kiosks must be able to select different badges in the same application. */
const sessionLayers = {
  isolate<Provided, Issue>(
    // Layer.fresh already infers which service the layer provides.
    layer: Layer.Layer<Provided, Issue>,
  ) {
    return Layer.fresh(layer);
  },
};

type StartupLayer<Provided, Failure> = Layer.Layer<Provided, Failure>;

/** A kiosk cannot start a session until it has read a card. */
const requireStartup = <Provided, Issue>(
  // The alias repeats the channels of the layer passed to Layer.orDie.
  startup: StartupLayer<Provided, Issue>,
) => Layer.orDie(startup);

/** Build a separate selection for each kiosk. An unreadable card stops startup. */
export const startSession = (read: () => string) =>
  requireStartup(
    sessionLayers.isolate(
      Layer.effect(Selection, scanCard(read).pipe(Effect.flatMap(Ref.make))),
    ),
  );

/** Read the current selection each time the operator requests a badge. */
const selectedId = Effect.fn("selectedId")(
  // The explicit result repeats the string type supplied by Ref.get.
  (selection: Ref.Ref<string>): Effect.Effect<string> => Ref.get(selection),
);

/** A busy directory can recover within the kiosk's time budget. */
function retryWithin<Issue, Value, Access>(
  // Sharing the failure type with the predicate still leaves Effect.retry able to infer it.
  lookup: Effect.Effect<Value, Issue, Access>,
  canRetry: (failure: Issue) => boolean,
  budget: Duration.Input,
) {
  return lookup.pipe(
    Effect.retry({
      while: canRetry,
      schedule: Schedule.exponential("20 millis").pipe(
        Schedule.upTo({ duration: budget }),
      ),
    }),
  );
}

/** Retry a busy directory with exponential backoff. An unknown badge fails immediately. */
function lookupSelection<Services>(
  lookup: (id: string) => Effect.Effect<Badge, LookupFailure, Services>,
  budget: Duration.Input,
) {
  return Effect.gen(function* () {
    const selection = yield* Selection;
    const id = yield* selectedId(selection);

    return yield* retryWithin(
      lookup(id),
      (failure) => failure._tag === "Busy",
      budget,
    );
  });
}

/** Give the display the badge or the cause of the failed lookup as an Exit. */
export const displayBadge = flow(
  lookupSelection,
  function <Reading, Failure, Services>(
    // The callback duplicates the signature of Effect.exit.
    lookup: Effect.Effect<Reading, Failure, Services>,
  ) {
    return lookup.pipe(Effect.exit);
  },
);
