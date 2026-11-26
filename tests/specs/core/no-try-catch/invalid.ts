import { createHash } from "node:crypto";

import { Effect, FileSystem } from "effect";

/**
 * fingerprintFile returns a content hash for a watcher to compare with its
 * previous hash. An unreadable file or a hash exception produces undefined.
 * The filesystem service reports read failures through Effect, but the hash
 * callback handles its synchronous exception with a try/catch statement.
 * The preset requires both failures to reach the same Effect recovery.
 */
export const fingerprintFile = Effect.fn("fingerprintFile")(function* (
  file: string,
) {
  const fs = yield* FileSystem.FileSystem;

  return yield* fs.readFile(file).pipe(
    Effect.map((bytes) => {
      // It incorrectly handles the hash exception with try/catch.
      try {
        return createHash("sha256").update(bytes).digest("base64url");
      } catch {
        return undefined;
      }
    }),
    Effect.orElseSucceed(() => undefined),
  );
});
