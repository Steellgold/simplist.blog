import { ResetPassword, VerifyEmail } from "@/components/emails";
import { passkey } from "@better-auth/passkey";
import { render } from "@react-email/render";
import { prisma } from "@simplist/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { lastLoginMethod, twoFactor } from "better-auth/plugins";
import { sendEmail } from "./ses";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    lastLoginMethod(),
    twoFactor({
      issuer: "Simplist",
    }),
    passkey({
      rpID: process.env.NODE_ENV === "development" ? "localhost" : "simplist.blog",
      rpName: "Simplist",
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    }),
  ],
  user: {
    changeEmail: {
      enabled: true
    },
    additionalFields: {
      firstName: {
        type: "string",
        required: true
      },
      lastName: {
        type: "string",
        required: true
      }
    }
  },
  appName: "Simplist",
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (data, request) => {
      console.log("SEND RESET PASSWORD", data);

      const userName = `${(data.user as any).firstName || ""} ${(data.user as any).lastName || ""}`.trim() || data.user.email;

      const emailHtml = await render(
        <ResetPassword
          name={userName}
          resetUrl={data.url}
        />
      );

      await sendEmail({
        to: data.user.email,
        subject: "Reset your password",
        html: emailHtml,
      })
    }
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const userName = `${(user as any).firstName || ""} ${(user as any).lastName || ""}`.trim() || user.email;

      const emailHtml = await render(
        <VerifyEmail
          name={userName}
          verificationUrl={url}
        />
      );

      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: emailHtml
      });
    },
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