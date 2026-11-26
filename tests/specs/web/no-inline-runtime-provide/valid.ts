import { Context, Effect, Layer, Ref } from "effect";

export class Seed extends Context.Service<Seed, { readonly initial: number }>()(
  "example/Seed",
) {
  static readonly layer = Layer.succeed(Seed, { initial: 0 });
}
interface CounterApi {
  readonly increment: Effect.Effect<number>;
}
export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  {
    make: Effect.gen(function* () {
      const seed = yield* Seed;
      const count = yield* Ref.make(seed.initial);

      return { increment: Ref.updateAndGet(count, (value) => value + 1) };
    }),
  },
) {
  static readonly layer = Layer.effect(Counter, Counter.make).pipe(
    Layer.provide(Seed.layer),
  );
}

/**
 * incrementNamed adds 1 to Counter and returns its new count. incrementTwice
 * returns 1 and then 2. Its caller provides one Counter around the complete
 * sequence, so both calls update the same Ref.
 */
export const incrementNamed = Effect.fn("increment")(function* () {
  const counter = yield* Counter;

  return yield* counter.increment;
});

export const incrementTwice = Effect.gen(function* () {
  const first = yield* incrementNamed();
  const second = yield* incrementNamed();

  return { first, second };
}).pipe(
  // It correctly provides one Counter for both increments.
  Effect.provide(Counter.layer),
);
