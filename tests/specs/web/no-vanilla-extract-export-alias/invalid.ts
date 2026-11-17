import { style } from "@vanilla-extract/css";

/**
 * The exported aliases incorrectly give generated classes additional names.
 * The panel alias requires another declaration to find its styles, and the
 * heading exports expose two public names for the same class.
 */
const panelBase = style({ width: "100%" });
// It incorrectly exports panelBase under another name.
export const panel = panelBase;

export const headingBase = style({ fontWeight: 600 });
export const heading = headingBase;
