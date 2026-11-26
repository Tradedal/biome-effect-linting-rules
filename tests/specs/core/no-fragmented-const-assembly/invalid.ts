const errorFields = (cause: Error) => ({ message: cause.message });

/**
 * The response incorrectly spreads a helper-produced fragment into its body.
 * The reader must inspect errorFields to discover the message field, so the
 * body declaration does not show its complete payload.
 */
export const response = (cause: Error) => ({
  status: 400,
  // It incorrectly spreads errorFields into the response body.
  body: { type: "ValidationFailure", ...errorFields(cause) },
});
