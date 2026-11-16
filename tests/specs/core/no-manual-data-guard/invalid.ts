interface User {
  readonly id: string;
  readonly active: boolean;
}

/**
 * The isUser predicate incorrectly maintains structural validation beside a
 * separate User declaration. Its id and active checks can drift from that
 * declared type without TypeScript checking that they establish the model.
 */
export const isUser = (input: unknown): input is User =>
  // It incorrectly checks the model fields by hand.
  typeof input === "object" &&
  input !== null &&
  "id" in input &&
  typeof input.id === "string" &&
  "active" in input &&
  typeof input.active === "boolean";
