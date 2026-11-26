import { Array as Arr, String as Str } from "effect";

const names = [" Mira ", "Owen"];

/**
 * trimmed removes surrounding whitespace from each display name. Arr.map
 * accepts Str.trim directly, so each name needs no forwarding callback.
 */
export const trimmed = Arr.map(
  names,
  // It correctly passes Str.trim directly to Arr.map.
  Str.trim,
);
