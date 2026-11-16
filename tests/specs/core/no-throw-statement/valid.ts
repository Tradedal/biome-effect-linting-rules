import { Data, Effect, type Option } from "effect";

interface Session {
  readonly displayName: string;
}

class SessionMissing extends Data.TaggedError("SessionMissing") {}

/**
 * requireSession returns the active session or fails with SessionMissing.
 * Effect.fromOption puts the expected rejection in the error channel, where
 * sessionMessage can turn it into a sign-in prompt. Defects still propagate.
 */
export const requireSession = Effect.fn("requireSession")(
  (session: Option.Option<Session>) =>
    // It correctly converts an absent session into a typed rejection.
    Effect.fromOption(() => new SessionMissing())(session),
);

/**
 * sessionMessage welcomes an active user or asks an unauthenticated user to
 * sign in. Effect.match selects the display text from success or typed failure.
 */
export const sessionMessage = Effect.fn("sessionMessage")(
  (session: Option.Option<Session>) =>
    requireSession(session).pipe(
      // It correctly turns SessionMissing into the sign-in prompt.
      Effect.match({
        onFailure: () => "Please sign in",
        onSuccess: ({ displayName }) => `Welcome, ${displayName}`,
      }),
    ),
);
