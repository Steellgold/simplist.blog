import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Notice",
  description: "Legal notice and publisher information for Simplist.",
};

const LegalNoticePage = () => {
  return (
    <article>
      <h1>Legal Notice</h1>

      <p className="text-muted-foreground">
        <strong>Last Updated:</strong> December 20, 2025
      </p>

      <h2>1. Publisher</h2>
      <p>
        The website <strong>simplist.blog</strong> and its subdomains (
        <code>app.simplist.blog</code>, <code>api.simplist.blog</code>) are
        published by:
      </p>
      <p>
        <strong>Gaëtan HUSZOVITS</strong>
        <br />
        Sole Proprietor (Auto-entrepreneur)
        <br />
        SIRET: 921 765 996 00019
        <br />
        Country: France
        <br />
        Email: <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a>
      </p>

      <h2>2. Publication Director</h2>
      <p>
        <strong>Gaëtan HUSZOVITS</strong>
      </p>

      <h2>3. Hosting</h2>
      <p>The Service is hosted by the following providers:</p>

      <h3>3.1 Web Applications (marketing site, dashboard, documentation)</h3>
      <p>
        <strong>Vercel Inc.</strong>
        <br />
        440 N Barranca Ave #4133
        <br />
        Covina, CA 91723
        <br />
        United States
        <br />
        Website:{" "}
        <a href="https://vercel.com" target="_blank" rel="noreferrer">
          https://vercel.com
        </a>
      </p>

      <h3>3.2 File Storage</h3>
      <p>
        <strong>Cloudflare, Inc.</strong>
        <br />
        101 Townsend St
        <br />
        San Francisco, CA 94107
        <br />
        United States
        <br />
        Website:{" "}
        <a href="https://www.cloudflare.com" target="_blank" rel="noreferrer">
          https://www.cloudflare.com
        </a>
      </p>

      <h3>3.3 Database</h3>
      <p>
        PostgreSQL database hosting provider with industry-standard security and
        data protection measures.
      </p>

      <h3>3.4 Cache and Performance</h3>
      <p>
        <strong>Upstash, Inc.</strong>
        <br />
        United States
        <br />
        Website:{" "}
        <a href="https://upstash.com" target="_blank" rel="noreferrer">
          https://upstash.com
        </a>
      </p>

      <h3>3.5 Transactional Emails</h3>
      <p>
        <strong>Amazon Web Services, Inc.</strong>
        <br />
        410 Terry Avenue North
        <br />
        Seattle, WA 98109
        <br />
        United States
        <br />
        Website:{" "}
        <a href="https://aws.amazon.com" target="_blank" rel="noreferrer">
          https://aws.amazon.com
        </a>
      </p>

      <h3>3.6 Payments</h3>
      <p>
        <strong>Stripe, Inc.</strong>
        <br />
        354 Oyster Point Boulevard
        <br />
        South San Francisco, CA 94080
        <br />
        United States
        <br />
        Website:{" "}
        <a href="https://stripe.com" target="_blank" rel="noreferrer">
          https://stripe.com
        </a>
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        All content on this website (text, graphics, logos, icons, images,
        software) is the exclusive property of Gaëtan HUSZOVITS or its partners
        and is protected by French and international intellectual property laws.
      </p>
      <p>
        Any reproduction, representation, modification, publication, or
        adaptation of all or part of the elements of the site, by any means or
        process, is prohibited without prior written authorization.
      </p>

      <h2>5. Personal Data Protection</h2>
      <p>
        In accordance with the General Data Protection Regulation (GDPR) and
        applicable data protection laws, you have rights over your personal
        data. For more information, please see our{" "}
        <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
        <Link href="/legal/gdpr">GDPR &amp; Data Protection</Link> page.
      </p>

      <h2>6. Cookies</h2>
      <p>
        This website uses strictly necessary cookies for the operation of the
        Service. For more information, please see our{" "}
        <Link href="/legal/cookies">Cookie Policy</Link>.
      </p>

      <h2>7. Governing Law and Jurisdiction</h2>
      <p>
        This legal notice is governed by French law. In the event of a dispute,
        and after an attempt to find an amicable solution, the French courts
        shall have exclusive jurisdiction.
      </p>

      <h2>8. Contact</h2>
      <p>
        For any questions regarding this legal notice, you can contact us at:
      </p>
      <p>
        Email: <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a>
      </p>

      <p className="mt-6 text-center font-medium">
        See also: <Link href="/legal/terms">Terms of Service</Link> |{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>
      </p>
    </article>
  );
};

export default LegalNoticePage;
