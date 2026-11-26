import { Context, Effect, Layer } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}
export class Seed extends Context.Service<Seed, { readonly initial: number }>()(
  "example/Seed",
) {}
export const dependencies = Layer.succeed(Seed, { initial: 3 });
const makeCounter = Effect.gen(function* () {
  const seed = yield* Seed;

  return { read: Effect.succeed(seed.initial) };
});

/**
 * Counter exposes a read of the configured seed value. Its static layer names
 * the service explicitly but looks up its constructor through this.make. The
 * preset requires Counter.make to identify the constructor explicitly.
 */
export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  { make: makeCounter },
) {
  // It incorrectly uses this.make for the constructor.
  static readonly layer = Layer.effect(Counter, this.make);
}

/**
 * ProvidedCounter supplies the same seeded read through an external factory.
 * Its layer must preserve that factory and provide Seed once during assembly.
 */
export class ProvidedCounter extends Context.Service<
  ProvidedCounter,
  CounterApi
>()("example/ProvidedCounter") {
  // It incorrectly uses this for the service key beside an external factory.
  static readonly layer = Layer.effect(this, makeCounter).pipe(
    Layer.provide(dependencies),
  );
}
