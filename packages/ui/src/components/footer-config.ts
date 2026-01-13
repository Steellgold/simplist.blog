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
      {
        href: "https://www.simplist.blog#features",
        label: "Features",
        external: true,
      },
      {
        href: "https://www.simplist.blog#pricing",
        label: "Pricing",
        external: true,
      },
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
      { href: "https://www.simplist.blog/legal/terms", label: "Terms of Service" },
      { href: "https://www.simplist.blog/legal/privacy", label: "Privacy Policy" },
      { href: "https://www.simplist.blog/legal/cookies", label: "Cookie Policy" },
      {
        href: "https://www.simplist.blog/legal/gdpr",
        label: "GDPR & Data Protection",
      },
      {
        href: "https://www.simplist.blog/legal/legal-notice",
        label: "Legal Notice",
      },
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
