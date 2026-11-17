import { Result } from "effect";

/**
 * The summarize function resolves the Result before it constructs the summary
 * object. The count field receives the selected value, so the object
 * declaration no longer contains a decision.
 */
export const summarize = (result: Result.Result<number, string>) => {
  // It correctly selects the count before the summary object.
  const count = Result.getOrElse(result, () => 0);

  return { count };
};
