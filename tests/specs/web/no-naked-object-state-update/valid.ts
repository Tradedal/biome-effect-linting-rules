import { Effect, pipe, Ref, Schema, Struct } from "effect";

const Book = Schema.Struct({ title: Schema.String });
const CopyHistory = Schema.Struct({ completed: Schema.Int });
const BookJson = Schema.fromJsonString(Book);
const encodeBook = Schema.encodeEffect(BookJson);
const decodeBook = Schema.decodeUnknownEffect(BookJson);
interface Storage {
  readonly write: (payload: string) => Effect.Effect<void>;
  readonly read: Effect.Effect<string>;
}

/**
 * copyBook writes the supplied book, reads a stored payload, and copies that
 * payload back. The Book JSON schema checks externally edited data before
 * the second write and copies only Book fields. Malformed books now fail
 * through the decoding channel. Valid books retain the same write, read,
 * and write sequence.
 * A successful copy increments the completed count and returns that history.
 * Struct.evolve and CopyHistory.make perform the state update as the preset
 * requires. A failed read, decode, or write leaves the history unchanged.
 */
export const copyBook = Effect.fn("copyBook")(function* (
  book: typeof Book.Type,
  storage: Storage,
  history: Ref.Ref<typeof CopyHistory.Type>,
) {
  // It correctly encodes the book with its JSON schema before the write.
  const original = yield* encodeBook(book);

  yield* storage.write(original);

  const raw = yield* storage.read;
  const decoded = yield* decodeBook(raw);
  const copy = yield* encodeBook(decoded);

  yield* storage.write(copy);

  yield* Ref.update(history, (current) =>
    pipe(
      current,
      Struct.evolve({ completed: (count) => count + 1 }),
      CopyHistory.make,
    ),
  );

  return yield* Ref.get(history);
});
