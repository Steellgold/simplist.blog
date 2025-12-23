export type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export const defaultFooterSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      {
        href: "https://docs.simplist.blog",
        label: "Documentation",
        external: true,
      },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/cookies", label: "Cookie Policy" },
      { href: "/legal/gdpr", label: "GDPR & Data Protection" },
      { href: "/legal/legal-notice", label: "Legal Notice" },
    ],
  },
  {
    title: "Developers",
    links: [
      {
        href: "https://docs.simplist.blog",
        label: "API Reference",
        external: true,
      },
      {
        href: "https://www.npmjs.com/package/@simplist.blog/sdk",
        label: "SDK",
        external: true,
      },
      { href: "https://app.simplist.blog", label: "Dashboard", external: true },
    ],
  },
];

export const footerTagline =
  "Simple, fast content management API for modern developers.";

export const footerBrandName = "Simplist";
