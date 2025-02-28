import { Component } from "@workspace/ui/components/utils/component";
import { Button, Container, Heading, Img, Link, Preview, Section, Text } from "@react-email/components";
import React from "react";
import { EmailBase } from "./base";

type EmailResetPasswordProps = {
  resetUrl: string;
  name: string;
};

const EmailResetPassword: Component<EmailResetPasswordProps> = ({ resetUrl, name }) => {
  const previewText = `We received a request to reset your password. If you didn't make the request, you can ignore this email.`;

  return (
    <EmailBase>
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
          Reset your password
        </Heading>

        <Section className="text-black text-[14px] leading-[24px]">
          <Text className="text-[14px] leading-[24px]">Hello <strong>{name}</strong>, we received a request to reset your password. If you didn&apos;t make the request, you can ignore this email.
          </Text>
        </Section>

        <Section className="text-center mt-[32px] mb-[32px]">
          <Button
            className="bg-yellow-400 rounded text-black text-[12px] font-semibold no-underline text-center px-5 py-3"
            href={resetUrl}
          >
            Reset Password
          </Button>
        </Section>
        
        <Text className="text-black text-[14px] leading-[24px]">
          or copy and paste this URL into your browser:{' '}
          <Link href={resetUrl} className="text-blue-600 no-underline">
            {resetUrl}
          </Link>
        </Text>
      </Container>
    </EmailBase>
  );
};

export { EmailResetPassword };