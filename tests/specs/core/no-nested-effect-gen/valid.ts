import { Schema } from "effect";

/**
 * readCount correctly returns the decoding Effect as its complete operation.
 * The input and decoder stay together without an extra generator scope.
 */
export const readCount =
  // It correctly exposes the schema decoder as the complete operation.
  Schema.decodeUnknownEffect(Schema.Int);
