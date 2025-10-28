import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { lastLoginMethod, twoFactor, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey"
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    lastLoginMethod(),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30
    }),
    twoFactor({
      issuer: "Simplist",
    }),
    passkey({
      rpID: process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, "") || "localhost",
      rpName: "Simplist",
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  }
});