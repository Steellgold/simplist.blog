import { multiSession, openAPI, organization, twoFactor } from "better-auth/plugins";
import { ac,  admin, editor, member, owner } from "./permissions";
import { passkey } from "better-auth/plugins/passkey";
import { betterAuth } from "better-auth";
import { Resend } from 'resend';
import { Pool } from "pg";
import { EmailVerification } from "@/emails";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    requireEmailVerification: true
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ( { user, url, token }, request) => {
      console.log("Sending email to", user.email, "with verification link", url);
      const { data, error } = await resend.emails.send({
        to: user.email,
        subject: "Verify your email address",
        from: "no-reply@simplist.blog",
        react: <EmailVerification confirmUrl={url} name={user.name} />,
      });

      console.log("Email sent", data, error);
    }
  },
  appName: "Simplist",
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"]
    }
  },
  plugins: [
    organization({
      ac: ac,
      roles: { member, editor, admin, owner }
    }),
    multiSession({
      maximumSessions: 1 // testing purposes
    }),
    passkey({
      rpName: "Simplist",
      origin: process.env.BETTER_AUTH_URL!,
    }),
    twoFactor({
      issuer: "simplist"
    }),
    openAPI()
  ],
  database: new Pool({
    connectionString: process.env.DATABASE_URL!
  }),
  trustedOrigins: [
    "http://192.168.1.132:3000" // Desktop at home - Remove when branch merged
  ]
});