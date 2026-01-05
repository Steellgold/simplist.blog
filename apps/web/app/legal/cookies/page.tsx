import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie Policy for the Simplist headless CMS and analytics platform.",
  alternates: {
    canonical: "/legal/cookies",
  },
};

const CookiePolicyPage = () => {
  return (
    <article>
      <h1>Cookie Policy</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date:</strong> December 17, 2025
        <br />
        <strong>Last Updated:</strong> December 17, 2025
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that a website stores on your device when
        you visit it. Similar technologies include localStorage, sessionStorage,
        and other browser-based storage mechanisms. These technologies allow
        websites and web applications to remember information about your visit
        (such as your session or preferences).
      </p>

      <h2>2. How Simplist Uses Cookies</h2>
      <p>
        Simplist uses a limited number of first-party cookies and browser
        storage values to provide essential functionality such as:
      </p>
      <ul>
        <li>Keeping you signed in to the dashboard;</li>
        <li>
          Protecting your account and our infrastructure from malicious
          activity;
        </li>
        <li>Remembering certain UI preferences (where applicable);</li>
        <li>Supporting privacy-friendly analytics where strictly necessary.</li>
      </ul>
      <p>
        We do <strong>not</strong> use third-party advertising or tracking
        cookies (such as Google Analytics, Facebook Pixel, etc.) inside the
        Simplist product.
      </p>

      <h2>3. Types of Cookies and Storage We Use</h2>
      <h3>3.1 Strictly necessary cookies</h3>
      <p>
        These cookies are essential for the operation of the dashboard and
        cannot be disabled without breaking core functionality:
      </p>
      <ul>
        <li>
          Authentication and session cookies/tokens used to keep you logged in;
        </li>
        <li>Security cookies used for CSRF protection and abuse prevention;</li>
        <li>
          Routing or infrastructure cookies required by our hosting platform.
        </li>
      </ul>

      <h3>3.2 Functional cookies and storage</h3>
      <p>
        We may use browser storage (such as localStorage or sessionStorage) to
        remember certain non-sensitive preferences and state, for example:
      </p>
      <ul>
        <li>Language or UI theme selections (where supported);</li>
        <li>Whether you have dismissed a particular in-app notice;</li>
        <li>
          Temporary session identifiers for in-app analytics in your own
          projects.
        </li>
      </ul>

      <h3>3.3 Analytics-related storage</h3>
      <p>
        When you integrate Simplist analytics on your own site, we may use
        session-based storage mechanisms to generate pseudonymous visitor and
        session identifiers (for example, a random session ID saved in
        sessionStorage). These identifiers:
      </p>
      <ul>
        <li>Are used only to compute analytics for your project;</li>
        <li>Are not used to build cross-site marketing profiles; and</li>
        <li>Are generally scoped to a single browser and/or device.</li>
      </ul>

      <h2>4. Managing Cookies</h2>
      <p>You can control cookies and storage in several ways:</p>
      <ul>
        <li>Adjust your browser settings to block or delete cookies;</li>
        <li>Use private or incognito modes to limit persistent storage;</li>
        <li>
          Configure your own website&apos;s consent banner or cookie controls if
          you have additional legal obligations when embedding Simplist
          analytics.
        </li>
      </ul>
      <p>
        Please note that if you block strictly necessary cookies, some parts of
        the Simplist dashboard may not function correctly (for example, you may
        not be able to log in or stay logged in).
      </p>

      <h2>5. Third-Party Cookies</h2>
      <p>
        Simplist itself does not set third-party advertising cookies. However,
        third-party services you choose to integrate (such as your own
        analytics, embeds, or scripts on your website) may set their own
        cookies. Those cookies are outside of Simplist&apos;s control and
        governed by the terms and policies of those services.
      </p>

      <h2>6. Changes to This Cookie Policy</h2>
      <p>
        We may update this Cookie Policy when our use of cookies changes or when
        legal requirements evolve. When we do, we will update the &quot;Last
        Updated&quot; date at the top of this page. In some cases we may also
        provide additional notice (such as in-app notifications).
      </p>

      <h2>7. Contact</h2>
      <p>
        If you have questions about this Cookie Policy or how we use cookies and
        similar technologies, please contact us at{" "}
        <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a>.
      </p>

      <p className="mt-6 text-center font-medium">
        For more information about how we handle personal data, please see our{" "}
        <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
        <Link href="/legal/gdpr">GDPR &amp; Data Protection</Link> pages.
      </p>
    </article>
  );
};

export default CookiePolicyPage;
