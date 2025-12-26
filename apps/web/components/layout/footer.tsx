"use client";

import {
  defaultFooterSections,
  footerBrandName,
  footerTagline,
  type FooterSection,
} from "@simplist/ui/components/footer-config";
import { MagicSVG } from "@simplist/ui/components/magic-svg";
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import { useVariableThemed } from "@simplist/ui/components/variable-themed";
import { useIsMobile } from "@simplist/ui/hooks/use-mobile";
import Link from "next/link";
import { SIMPLIST_BIG_SVG } from "./svg";

export const Footer = () => {
  const isMobile = useIsMobile();

  const svgWidth = isMobile ? 320 : 800;
  const svgHeight = isMobile ? 36 : 90;

  return (
    <footer className="overflow-hidden px-4 pt-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-2 text-2xl font-extrabold">
              {footerBrandName}
            </div>
            <p className="text-muted-foreground mb-2 text-sm">
              {footerTagline}
            </p>

            <ThemeSwitcher className="w-fit" />
          </div>

          {defaultFooterSections.map((section: FooterSection) => (
            <div key={section.title}>
              <div className="mb-4 font-semibold">{section.title}</div>
              <ul className="text-muted-foreground space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-foreground transition-colors"
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex w-full justify-center">
          <MagicSVG
            gradientFrom={useVariableThemed({
              light: "#060607",
              dark: "#A8A8A8",
            })}
            gradientSize={isMobile ? 54 : 136}
            gradientTo={useVariableThemed({
              light: "#121211",
              dark: "#F0BB3B",
            })}
            width={svgWidth}
            height={svgHeight}
            strokeColor={useVariableThemed({
              light: "#11111110",
              dark: "#A8A8A8",
            })}
          >
            <svg
              width={svgWidth}
              height={svgHeight * 1.87}
              viewBox="0 0 800 168"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={SIMPLIST_BIG_SVG} fill="black" />
            </svg>
          </MagicSVG>
        </div>
      </div>
    </footer>
  );
};
