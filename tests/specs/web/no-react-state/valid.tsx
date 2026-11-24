import React, { useId } from "react";

import { useAtomSuspense, useAtomValue } from "@effect/atom-react";
import { Context, Effect, Layer, Queue, Stream } from "effect";
import { Atom } from "effect/reactivity";

interface Dimensions {
  readonly width: number;
  readonly height: number;
}

class Viewport extends Context.Service<
  Viewport,
  { readonly dimensions: Stream.Stream<Dimensions> }
>()("example/Viewport") {
  static readonly layer = Layer.succeed(Viewport, {
    dimensions: Stream.callback<Dimensions>((queue) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const update = () =>
            Queue.offerUnsafe(queue, {
              width: window.innerWidth,
              height: window.innerHeight,
            });
          window.addEventListener("resize", update);
          update();

          return update;
        }),
        (update) =>
          Effect.sync(() => window.removeEventListener("resize", update)),
      ),
    ),
  });
}

const viewportRuntime = Atom.runtime(Viewport.layer);
const viewportLabelAtom = viewportRuntime.atom(
  Stream.unwrap(Effect.map(Viewport, (viewport) => viewport.dimensions)).pipe(
    Stream.map(({ width, height }) => `${width} × ${height}`),
  ),
);

/**
 * ViewportSize displays the browser viewport dimensions and updates after a
 * resize. The Viewport service emits both dimensions through one listener and
 * removes it when the stream closes. The atom prepares the label before the
 * component reads it. This requires a browser and a surrounding Suspense
 * boundary for the initial stream value.
 */
export function ViewportSize() {
  const outputId = useId();
  // It correctly reads the prepared viewport label from an atom.
  const label = useAtomSuspense(viewportLabelAtom).value;

  return React.createElement("output", { id: outputId }, label);
}

export { useAtomSet, useAtomValue } from "@effect/atom-react";

const readingMode = Atom.make("Quiet reading");

/**
 * ReadingModeStatus shows the current reading mode. The atom supplies the
 * setting so the status can share it with other controls.
 */
export function ReadingModeStatus() {
  // It correctly reads the displayed reading mode from an atom.
  const mode = useAtomValue(readingMode);

  return React.createElement("output", null, mode);
}
