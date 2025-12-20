import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-2 text-lg font-bold">Simplist</div>
            <p className="text-muted-foreground mb-2 text-sm">
              Simple, fast content management API for modern developers.
            </p>

            <ThemeSwitcher className="w-fit" />
          </div>

          <div>
            <div className="mb-4 font-semibold">Product</div>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link
                  href="#features"
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#docs"
                  className="hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4 font-semibold">Legal</div>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/gdpr"
                  className="hover:text-foreground transition-colors"
                >
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4 font-semibold">Developers</div>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link
                  href="/docs/api"
                  className="hover:text-foreground transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.npmjs.com/package/@simplist.blog/sdk"
                  className="hover:text-foreground transition-colors"
                >
                  SDK
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/examples"
                  className="hover:text-foreground transition-colors"
                >
                  Examples
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Simplist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
