import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/db";

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET ?? "development-only-secret-placeholder-123456";

export const auth = betterAuth({
  baseURL,
  secret,
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [admin()]
});