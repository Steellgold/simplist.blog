import { SES } from "@aws-sdk/client-ses"

type SendEmailOptions = {
  to: string
  subject: string
  html: string
}

const ses = new SES({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  const from = process.env.SES_FROM_EMAIL || "no-reply@simplist.blog"

  await ses.sendEmail({
    Source: from,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
  })
}

