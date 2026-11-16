import { Array as Arr, String as Str } from "effect";

const names = [" Mira ", "Owen"];

/**
 * trimmed incorrectly uses a named function and block for one trim expression.
 * The callback needs no local values or dynamic receiver, so its extra scope
 * adds no work to the name transformation.
 */
export const trimmed = Arr.map(names, function trim(name) {
  // This block incorrectly adds a return-only scope around the name trim.
  return Str.trim(name);
});
