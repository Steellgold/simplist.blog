import { Component } from "@workspace/ui/components/utils/component";
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";
import React from "react";

type EmailVerificationProps = {
  confirmUrl: string;

  invitedBy: string;
  userInvited: string;
};

const EmailVerification: Component<EmailVerificationProps> = ({ confirmUrl, invitedBy, userInvited }) => {
  const previewText = `Verify your email address to finish setting up your account.`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Preview>{previewText}</Preview>
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`https://github.com/Steellgold/simplist/blob/prod/public/_static/logos/simplist.png?raw=true`}
                height="37"
                alt="Vercel"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              You&apos;re invited to join a team on Vercel 
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {userInvited},
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmUrl}
              >
                Confirm Email Address
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={confirmUrl} className="text-blue-600 no-underline">
                {confirmUrl}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This invitation was intended for{' '}
              <span className="text-black">{invitedBy}</span>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export { EmailVerification };