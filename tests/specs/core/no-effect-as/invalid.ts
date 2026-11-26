import { Effect } from "effect";
import { HttpClient } from "effect/http";

/**
 * isListening reports whether the endpoint responds, including with a 503.
 * The success replacement and false fallback manually implement the predicate
 * that Effect.isSuccess already provides. Request failures become false;
 * defects still propagate.
 */
export const isListening = Effect.fn("isListening")((endpoint: string) =>
  HttpClient.get(`${endpoint}/status`).pipe(
    // It incorrectly supplies a success flag through Effect.as.
    Effect.as(true),
    Effect.orElseSucceed(() => false),
  ),
);
