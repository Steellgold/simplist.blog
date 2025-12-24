"use client";

import type { SVGProps } from "react";
import { forwardRef } from "react";

export const Webhook = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
      <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
      <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
    </svg>
  ),
);

Webhook.displayName = "Webhook";

export const WebhookOff = forwardRef<
  SVGSVGElement,
  SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M17 17h-5c-1.09-.02-1.94.92-2.5 1.9A3 3 0 1 1 2.57 15" />
    <path d="M9 3.4a4 4 0 0 1 6.52.66" />
    <path d="m6 17 3.1-5.8a2.5 2.5 0 0 0 .057-2.05" />
    <path d="M20.3 20.3a4 4 0 0 1-2.3.7" />
    <path d="M18.6 13a4 4 0 0 1 3.357 3.414" />
    <path d="m12 6 .6 1" />
    <path d="m2 2 20 20" />
  </svg>
));

WebhookOff.displayName = "WebhookOff";