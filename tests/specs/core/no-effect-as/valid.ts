import { Effect } from "effect";
import { HttpClient } from "effect/http";

/**
 * isListening reports whether the endpoint responds, including with a 503.
 * Effect.isSuccess returns false for a request failure and preserves defects.
 */
export const isListening = Effect.fn("isListening")((endpoint: string) =>
  HttpClient.get(`${endpoint}/status`).pipe(
    // It correctly uses Effect.isSuccess to report whether the request succeeds.
    Effect.isSuccess,
  ),
);
