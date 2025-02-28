import { Component } from "@workspace/ui/components/utils/component";
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";
import React from "react";
import { TailwindConfiguration } from "@/tailwind.config";

type EmailVerificationProps = {
  confirmUrl: string;
  name: string;
};

const EmailVerification: Component<EmailVerificationProps> = ({ confirmUrl, name }) => {
  const previewText = `Verify your email address to finish setting up your account.`;

  return (
    <Html>
      <Head />
      <Tailwind config={TailwindConfiguration}>
        <Body className="bg-[#f0f0f0] my-auto mx-auto font-sans px-2 py-2">
          <Preview>{previewText}</Preview>
          <Container className="border border-solid rounded my-[40px] mx-auto p-[20px] max-w-[465px] border-[#1d1d1d]">
            <Section className="mt-[32px]">
              <Img
                src={`https://github.com/Steellgold/simplist/blob/prod/public/_static/logos/simplist.png?raw=true`}
                height="37"
                alt="Simplist"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[22px] font-normal text-center p-0 my-[30px] mx-0">
              Verify your email address
            </Heading>
          

            <Section className="text-black text-[14px] leading-[24px]">
              <Text className="text-[14px] leading-[24px]">Hello <strong>{name}</strong>, please click the button below to verify your email address and finish setting up your account.
              </Text>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-yellow-400 rounded text-black text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmUrl}
              >
                Verify Email
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={confirmUrl} className="text-blue-600 no-underline">
                {confirmUrl}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export { EmailVerification };