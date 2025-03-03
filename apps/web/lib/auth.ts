import { multiSession, openAPI, organization, twoFactor } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import { ac,  admin, editor, member, owner } from "./permissions";
import { passkey } from "better-auth/plugins/passkey";
import { betterAuth } from "better-auth";
import { resend } from "./resend";
import Stripe from "stripe";
import { BUSINESS_PRICE_IDS, PRO_PRICE_IDS } from "@workspace/ui/lib/pricing";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        to: user.email,
        subject: "Reset your password",
        from: "no-reply@simplist.blog",
        html: `Click <a href="${url}">here</a> to reset your password`, // Temporary
        // react: <EmailResetPassword resetUrl={url} name={user.name} />
      });

      // TODO: Switch to AWS SES
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ( { user, url }) => {
      await resend.emails.send({
        to: user.email,
        subject: "Verify your email address",
        from: "no-reply@simplist.blog",
        html: `Click <a href="${url}">here</a> to verify your email address`, // Temporary
        // react: <EmailVerification confirmUrl={url} name={user.name} />,
      });

      // TODO: Switch to AWS SES
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
    openAPI(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          { name: "Pro", priceId: PRO_PRICE_IDS.monthly, annualDiscountPriceId: PRO_PRICE_IDS.yearly },
          { name: "Business", priceId: BUSINESS_PRICE_IDS.monthly, annualDiscountPriceId: BUSINESS_PRICE_IDS.yearly }
        ],
        authorizeReference: async ({ user, referenceId, action }) => {
          if (action === "upgrade-subscription" || action === "cancel-subscription") {
            const org = await prisma.member.findFirst({
              where: {
                organizationId: referenceId,
                userId: user.id
              }   
            });
            return org?.role === "owner"
          }
          return true;
        }
      }
    })
  ],
  database: new Pool({
    connectionString: process.env.DATABASE_URL!
  }),
  // database: prismaAdapter(prisma, {
  //   provider: "postgresql"
  // }),
  trustedOrigins: [
    "http://192.168.1.132:3000" // Desktop at home - Remove when branch merged
  ]
});