/**
 * The response correctly defines the complete nested body in one place.
 * Its type and message are visible together without a fragment helper.
 */
export const response = (cause: Error) => ({
  status: 400,
  // It correctly declares the complete response body here.
  body: { type: "ValidationFailure", message: cause.message },
});

/**
 * workflow replaces the first existing step with checkout and corepack.
 * The base job supplies its name. Its spread extends a complete input record,
 * which the preset allows, and the new step list stays visible here.
 */
export const workflow = (
  baseJob: { readonly name: string },
  existingSteps: ReadonlyArray<string>,
) => ({
  // It correctly extends the supplied job rather than a helper-produced fragment.
  ...baseJob,
  steps: ["checkout", "corepack", ...existingSteps.slice(1)],
});

/**
 * request adds a delay of 100 to each attempt and retains the supplied endpoint.
 * Each spread extends a complete input record. The retry transformation stays
 * in the request declaration, as the preset requires.
 */
export const request = (
  defaults: { readonly endpoint: string },
  attempts: ReadonlyArray<{ readonly number: number }>,
) => ({
  ...defaults,
  // It correctly extends each supplied attempt within the request.
  retries: attempts.map((attempt) => ({ ...attempt, delay: 100 })),
});
