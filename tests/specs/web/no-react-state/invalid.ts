import * as React from "react";
import ReactDefault, {
  createElement,
  useId,
  useLayoutEffect as useSubscription,
  useState as useLocalState,
  useRef as useValue,
} from "react";

/**
 * ViewportSize displays the browser viewport dimensions and updates after a
 * resize. React state holds one dimensions value, and one layout effect
 * maintains its listener. These APIs are supported by React. The preset
 * requires service-managed subscriptions and an atom for the prepared label.
 * This component requires a browser.
 */
export function ViewportSize() {
  const outputId = useId();
  const readDimensions = ReactDefault.useCallback(
    () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    [],
  );
  const [dimensions, setDimensions] = useLocalState(readDimensions);

  useSubscription(() => {
    const update = () => setDimensions(readDimensions());
    window.addEventListener("resize", update);
    update();

    return () => window.removeEventListener("resize", update);
  }, [readDimensions]);

  // It incorrectly caches the display label through React.useMemo.
  const label = React.useMemo(
    () => `${dimensions.width} × ${dimensions.height}`,
    [dimensions],
  );

  return createElement("output", { id: outputId }, label);
}

/**
 * The viewport module exposes a React subscription hook to its consumers.
 * The preset requires application consumers to use atom hooks for that work.
 */
export {
  // It incorrectly re-exports a React synchronization API.
  useEffect,
} from "react";

/**
 * ReadingModeStatus shows the current reading mode. The component stores the
 * application setting in a ref. The preset requires an atom for the setting.
 */
export function ReadingModeStatus() {
  // It incorrectly stores the displayed reading mode in a React ref.
  const mode = useValue("Quiet reading");

  return createElement("output", null, mode.current);
}
