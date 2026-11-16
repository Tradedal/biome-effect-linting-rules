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
 * Counter exposes a read of the configured seed value. Its layer names the
 * service and constructor explicitly, as the preset requires.
 */
export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  { make: makeCounter },
) {
  // It correctly names the service and constructor.
  static readonly layer = Layer.effect(Counter, Counter.make);
}

/**
 * ProvidedCounter supplies the same seeded read through an external factory.
 * Its layer must preserve that factory and provide Seed once during assembly.
 */
export class ProvidedCounter extends Context.Service<
  ProvidedCounter,
  CounterApi
>()("example/ProvidedCounter") {
  // It correctly names the service and preserves the external factory.
  static readonly layer = Layer.effect(ProvidedCounter, makeCounter).pipe(
    Layer.provide(dependencies),
  );
}
