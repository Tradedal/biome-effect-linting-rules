import {
  Context,
  type Duration,
  Effect,
  flow,
  Layer,
  Ref,
  Schedule,
  type Scope,
  Stream,
} from "effect";

/**
 * A badge kiosk starts a session with the ID from its card reader. Each session
 * keeps its own selection. When the operator requests a badge, the kiosk looks
 * up the selected ID and gives the display the outcome, including any failure.
 * See {@link Layer.fresh} for session isolation and {@link Effect.retry} and
 * {@link Schedule.upTo} for the directory's retry policy.
 * Compare the [same kiosk with the redundant annotations](./invalid.ts).
 */
class Selection extends Context.Service<Selection, Ref.Ref<string>>()(
  "example/Selection",
) {}

type Badge = { readonly displayName: string };
type LookupFailure =
  | { readonly _tag: "Busy" }
  | { readonly _tag: "UnknownBadge" };

/** A card can move during a scan. Give the reader one more attempt if it throws. */
const scanCard = (read: () => string) =>
  Effect.try({ try: read, catch: () => "Unreadable card" }).pipe(
    // Effect.retry infers the ID and read failure from the scan.
    Effect.retry({ times: 1 }),
  );

/** Build a separate selection for each kiosk. An unreadable card stops startup. */
export const startSession = (read: () => string) =>
  Layer.effect(Selection, scanCard(read).pipe(Effect.flatMap(Ref.make))).pipe(
    // Layer.fresh isolates the selection and Layer.orDie makes startup failure fatal.
    Layer.fresh,
    Layer.orDie,
  );

/** Read the current selection each time the operator requests a badge. */
const selectedId = Effect.fn("selectedId")((selection: Ref.Ref<string>) =>
  // Ref.get supplies the ID type.
  Ref.get(selection),
);

/** Retry a busy directory with exponential backoff. An unknown badge fails immediately. */
function lookupSelection<Services>(
  lookup: (id: string) => Effect.Effect<Badge, LookupFailure, Services>,
  budget: Duration.Input,
) {
  return Effect.gen(function* () {
    const selection = yield* Selection;
    const id = yield* selectedId(selection);

    return yield* lookup(id).pipe(
      // Schedule.upTo bounds the retry schedule. The lookup supplies the predicate's failure type.
      Effect.retry({
        while: (failure) => failure._tag === "Busy",
        schedule: Schedule.exponential("20 millis").pipe(
          Schedule.upTo({ duration: budget }),
        ),
      }),
    );
  });
}

/** Give the display the badge or the cause of the failed lookup as an Exit. */
export const displayBadge = flow(
  lookupSelection,
  // Effect.exit takes the lookup result directly.
  Effect.exit,
);

type SelectionLayer<Failure> = Layer.Layer<Selection, Failure>;

/** A kiosk with an external card reader can supply its own selection at startup. */
export const startExternalSession = <Failure>(
  // This contract requires the same Selection service used by lookupSelection.
  selection: SelectionLayer<Failure>,
) => Layer.orDie(selection);

/** Retry an external scan once when the reader marks its failure as transient. */
const retryTransientScan = <
  Value,
  Issue extends { readonly retryable: boolean },
  Services,
>(
  // The predicate needs the reader's retryable flag.
  scan: Effect.Effect<Value, Issue, Services>,
) =>
  scan.pipe(Effect.retry({ times: 1, while: (failure) => failure.retryable }));

/** Give a disconnected external reader one more attempt to open by default. */
const openReader = <Value, Failure, Services>(
  acquire: Effect.Effect<Value, Failure, Services>,
  // Operators can override the default when a reader takes longer to reconnect.
  retries = 1,
) => acquire.pipe(Effect.retry({ times: retries }));

/**
 * In continuous mode the reader emits card IDs. For each ID, the kiosk reads
 * the badge for display and retries once if the scan failure permits it.
 * Opening the reader and reading the next card can fail independently.
 * {@link Stream.unwrap} combines those failures and manages the opening scope.
 */
export const watchBadges = <
  OpenFailure,
  ReadFailure,
  ReaderServices,
  ScanFailure extends { readonly retryable: boolean },
  ScanServices,
>(
  // The reader supplies a scoped acquisition Effect and a fallible stream.
  open: Effect.Effect<
    Stream.Stream<string, ReadFailure, ReaderServices>,
    OpenFailure,
    Scope.Scope
  >,
  readBadge: (id: string) => Effect.Effect<Badge, ScanFailure, ScanServices>,
  openRetries?: number,
) =>
  Stream.unwrap(openReader(open, openRetries)).pipe(
    Stream.mapEffect((id) => retryTransientScan(readBadge(id.trim()))),
  );
