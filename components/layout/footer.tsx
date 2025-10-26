import { ThemeSwitcher } from "@/components/ui/switch-theme";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t">
      <div className="container max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg mb-2">Simplist</div>
            <p className="text-sm text-muted-foreground mb-2">
              Simple, fast content management API for modern developers.
            </p>

            <ThemeSwitcher className="w-fit" />
          </div>

          <div>
            <div className="font-semibold mb-4">Product</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-4">Legal</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/gdpr" className="hover:text-foreground transition-colors">GDPR Compliance</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-4">Developers</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/docs/api" className="hover:text-foreground transition-colors">API Reference</Link></li>
              <li><Link href="https://www.npmjs.com/package/@simplist.blog/sdk" className="hover:text-foreground transition-colors">SDK</Link></li>
              <li><Link href="/docs/examples" className="hover:text-foreground transition-colors">Examples</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Simplist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
