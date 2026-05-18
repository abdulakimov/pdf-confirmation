import { randomBytes } from "node:crypto";

const PUBLIC_TOKEN_BYTES = 24;

export function generatePublicVerificationToken() {
  return randomBytes(PUBLIC_TOKEN_BYTES).toString("base64url");
}
