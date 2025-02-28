import { TailwindConfiguration } from "@/tailwind.config";
import { Body, Head, Html, Tailwind } from "@react-email/components";
import { Component } from "@workspace/ui/components/utils/component";
import { PropsWithChildren } from "react";

export const EmailBase: Component<PropsWithChildren> = ({ children }) => {
  return (
    <Html>
      <Head />
      <Tailwind config={TailwindConfiguration}>
        <Body className="bg-[#f0f0f0] my-auto mx-auto font-sans px-2 py-2">{children}</Body>
      </Tailwind>
    </Html>
  );
}