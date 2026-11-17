import { style } from "@vanilla-extract/css";

/**
 * The classes correctly use their style declarations as their only exported
 * names. Consumers can identify each class and its definition without
 * following an alias.
 */
export const panel =
  // It correctly exports the panel style under one name.
  style({ width: "100%" });
export const heading = style({ fontWeight: 600 });

/**
 * The compact class correctly adds its own styles to the panel class.
 * Vanilla Extract generates a new class for that composition.
 */
export const compactPanel =
  // It correctly composes a new class with additional styles.
  style([panel, { minWidth: 0 }]);
