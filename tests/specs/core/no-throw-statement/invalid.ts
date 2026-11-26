import { Data, Effect, Option } from "effect";

interface Session {
  readonly displayName: string;
}

class SessionMissing extends Data.TaggedError("SessionMissing") {}

/**
 * requireSession returns the active session or refuses access when it is absent.
 * The absent branch throws an expected rejection as a defect. sessionMessage
 * cannot convert that defect into its sign-in prompt through ordinary recovery.
 */
export const requireSession = Effect.fn("requireSession")(
  (session: Option.Option<Session>) =>
    Option.match(session, {
      onSome: Effect.succeed,
      onNone: () =>
        Effect.sync(() => {
          // It incorrectly throws the expected SessionMissing rejection as a defect.
          throw new SessionMissing();
        }),
    }),
);

/**
 * sessionMessage welcomes an active user or asks an unauthenticated user to
 * sign in. Effect.match handles typed failures, so the thrown rejection prevents
 * the sign-in prompt from being returned.
 */
export const sessionMessage = Effect.fn("sessionMessage")(
  (session: Option.Option<Session>) =>
    requireSession(session).pipe(
      // It correctly handles typed failures, but the thrown rejection bypasses it.
      Effect.match({
        onFailure: () => "Please sign in",
        onSuccess: ({ displayName }) => `Welcome, ${displayName}`,
      }),
    ),
);
