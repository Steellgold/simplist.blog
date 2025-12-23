import { SES } from "@aws-sdk/client-ses";

const ses = new SES({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type SendSimplistEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendSimplistEmailOptions): Promise<void> => {
  try {
    await ses.sendEmail({
      Source: "no-reply@simplist.blog",
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
