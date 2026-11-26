import { createHash } from "node:crypto";

import { Effect, FileSystem } from "effect";

/**
 * fingerprintFile returns a content hash for a watcher to compare with its
 * previous hash. The filesystem service reads the bytes, and Effect.try captures
 * a synchronous hash exception. Recovery covers both operations, so an
 * unreadable file or a hash exception still produces undefined.
 */
export const fingerprintFile = Effect.fn("fingerprintFile")(function* (
  file: string,
) {
  const fs = yield* FileSystem.FileSystem;

  return yield* fs.readFile(file).pipe(
    // It correctly captures the hash exception before the shared recovery.
    Effect.flatMap((bytes) =>
      Effect.try(() => createHash("sha256").update(bytes).digest("base64url")),
    ),
    Effect.orElseSucceed(() => undefined),
  );
});
