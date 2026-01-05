import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for the Simplist headless CMS and analytics platform.",
  alternates: {
    canonical: "/legal/privacy",
  },
};

const PrivacyPolicyPage = () => {
  return (
    <article>
      <h1>Privacy Policy</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date:</strong> December 17, 2025
        <br />
        <strong>Last Updated:</strong> December 17, 2025
      </p>

      <h2>1. Overview</h2>
      <p>
        This Privacy Policy explains how Simplist (&quot;Simplist&quot;,
        &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses,
        stores, and shares personal data when you visit{" "}
        <code>simplist.blog</code> or <code>app.simplist.blog</code>, create and
        use an account, integrate our REST API at <code>api.simplist.blog</code>
        , or use our TypeScript SDK <code>@simplist.blog/sdk</code>.
      </p>
      <p>
        We are committed to protecting your privacy and complying with
        applicable data protection laws, including the General Data Protection
        Regulation (GDPR).
      </p>

      <h2>2. Data Controller</h2>
      <p>The data controller responsible for your personal data is:</p>
      <p>
        <strong>Gaëtan HUSZOVITS</strong>
        <br />
        Email: <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a>
        <br />
        Website: <a href="https://simplist.blog">https://simplist.blog</a>
        <br />
        Country: France
      </p>

      <h2>3. Legal Bases for Processing</h2>
      <p>We process your personal data under the following legal bases:</p>
      <ul>
        <li>
          <strong>Contract performance (Art. 6(1)(b) GDPR):</strong> to provide,
          operate, and support your use of the Service (account creation,
          authentication, projects, articles, analytics dashboards, API).
        </li>
        <li>
          <strong>Legitimate interests (Art. 6(1)(f) GDPR):</strong> to secure
          our systems, prevent abuse, measure performance, and improve features.
        </li>
        <li>
          <strong>Legal obligations (Art. 6(1)(c) GDPR):</strong> to comply with
          tax, accounting, and regulatory requirements.
        </li>
        <li>
          <strong>Consent (Art. 6(1)(a) GDPR):</strong> where required for
          optional tracking or integrations that are not strictly necessary for
          the Service.
        </li>
      </ul>

      <h2>4. Data We Collect</h2>

      <h3>4.1 Account and profile data</h3>
      <p>When you create or manage an account, we collect:</p>
      <ul>
        <li>Email address;</li>
        <li>Name and optional first/last name fields;</li>
        <li>Profile image URL (from OAuth providers, if provided);</li>
        <li>Account creation and update timestamps;</li>
        <li>
          Account deletion workflow fields (e.g. deletionRequestedAt,
          deletionScheduledAt, deletionCanceledAt, reminder flags).
        </li>
      </ul>

      <h3>4.2 Authentication data</h3>
      <p>Depending on the sign-in method you use:</p>
      <ul>
        <li>
          <strong>Email + password:</strong> we store a cryptographic hash of
          your password (never the plaintext), and email verification status.
        </li>
        <li>
          <strong>OAuth (Google, GitHub):</strong> we store your provider ID,
          basic profile information (such as email, name, avatar URL), and
          tokens needed to maintain your session.
        </li>
        <li>
          <strong>Passkeys (WebAuthn):</strong> we store your public key,
          credential ID, and passkey metadata, but never your private key.
        </li>
        <li>
          <strong>Two-factor authentication (TOTP):</strong> we store encrypted
          secrets and backup codes used to verify login attempts.
        </li>
      </ul>

      <h3>4.3 Session and security data</h3>
      <p>
        To maintain secure sessions and detect suspicious sign-ins, we collect:
      </p>
      <ul>
        <li>Session tokens and expiration times;</li>
        <li>IP address and user agent at session creation;</li>
        <li>
          Basic device and browser data used to detect unusual login activity.
        </li>
      </ul>

      <h3>4.4 Project and content data</h3>
      <p>Within each project we store configuration and content including:</p>
      <ul>
        <li>
          Project metadata: name, slug, icon, color, avatar URL, timezone,
          default language, allowed origins, base URL, article URL pattern,
          subscription tier, subscription state, storage usage, monthly API call
          counters.
        </li>
        <li>
          Articles: title, slug, content, excerpt, cover image URLs, status
          (draft/published/deleted/scheduled), publishedAt, scheduledPublishAt,
          statistics (word count, character count, line count, estimated read
          time), and relationships to tags and variants.
        </li>
        <li>
          Article variants: same as articles but per language, with their own
          content, cover image, and statistics.
        </li>
        <li>Tags: name, icon, color, and relationships to articles.</li>
        <li>
          Webhooks: URLs, subscribed events, headers, custom templates, secret
          values, and delivery history.
        </li>
      </ul>
      <p>
        Content may include personal data if you or your users choose to store
        such information. You are responsible for ensuring that such content is
        collected and processed lawfully.
      </p>

      <h3>4.5 Members, roles, and invitations</h3>
      <p>For collaboration features, we store:</p>
      <ul>
        <li>
          Project members (userId, projectId, roleId, invitedBy, invitedAt,
          joinedAt);
        </li>
        <li>
          Project roles (name, slug, and booleans for each permission, such as
          canManageProject, canManageMembers, canViewAnalytics,
          canManageBilling, canDeleteProject);
        </li>
        <li>
          Invitations (email, projectId, roleId, token, status, expiresAt,
          invitedBy, invitedAt, acceptedAt).
        </li>
      </ul>

      <h3>4.6 API keys</h3>
      <p>For each API key we store:</p>
      <ul>
        <li>Key ID and secret value;</li>
        <li>Display name and permissions (e.g. read, analytics);</li>
        <li>Project association;</li>
        <li>Optional expiration date;</li>
        <li>Last used timestamp and current status (active/deleted);</li>
        <li>Creation and deletion timestamps.</li>
      </ul>

      <h3>4.7 Analytics data (visitors to your articles)</h3>
      <p>
        When you enable Simplist analytics and instrument your articles, we
        collect and process pseudonymous visitor analytics including:
      </p>
      <ul>
        <li>
          Article and project identifiers (which article was viewed, in which
          project);
        </li>
        <li>
          Pseudonymous visitor IDs and session IDs (generated client- or
          server-side);
        </li>
        <li>
          Device and browser data: user agent, browser name/version, OS
          name/version, screen width/height, device type;
        </li>
        <li>
          Traffic data: referrer URL and domain, UTM parameters (source, medium,
          campaign, term, content), page URL and title;
        </li>
        <li>
          Derived geographic data (when requested): country, region, city,
          timezone, country code, using IP-based geolocation via trusted
          providers;
        </li>
        <li>
          Engagement metrics: time on page, scroll depth, exit position, bounce
          flag, and timestamp of views and events;
        </li>
        <li>
          Events: event type (e.g. scroll milestone, click), element selectors,
          event-specific data, and time offsets.
        </li>
      </ul>
      <p>
        These analytics are designed to be privacy-friendly and are primarily
        used to provide aggregated statistics in your analytics dashboards. They
        are not used to build marketing profiles or sell data.
      </p>

      <h3>4.8 Billing and payment data</h3>
      <p>
        We use Stripe to process payments. Through Stripe we receive and store
        the following billing-related data:
      </p>
      <ul>
        <li>Stripe customer ID and subscription ID;</li>
        <li>Plan type, billing interval, and subscription status;</li>
        <li>
          Basic payment method metadata (e.g. card brand, last four digits,
          expiry date);
        </li>
        <li>Billing address and country (used for tax calculations);</li>
        <li>
          Invoice and payment history (amount, currency, status, timestamps).
        </li>
      </ul>
      <p>
        We do <strong>not</strong> store full card numbers, CVV codes, or bank
        account details; Stripe handles those directly.
      </p>

      <h3>4.9 Technical and diagnostic logs</h3>
      <p>To operate and secure the Service, we log:</p>
      <ul>
        <li>
          API request metadata (path, method, status code, response time,
          projectId, apiKeyId where relevant);
        </li>
        <li>Error logs, stack traces, and context required for debugging;</li>
        <li>
          Scheduler activity (e.g. scheduled publishing, invitation expiry,
          account deletion cron jobs);
        </li>
        <li>
          Cache and queue operations associated with analytics and article
          caching.
        </li>
      </ul>

      <h2>5. How We Use Your Data</h2>
      <p>We use the data described above to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service and its features;</li>
        <li>
          Authenticate your Account and authorize access based on project roles
          and permissions;
        </li>
        <li>Store and serve your Content via the dashboard, API, and SDK;</li>
        <li>Generate analytics dashboards and statistics for your projects;</li>
        <li>Enforce subscription quotas and plan limits;</li>
        <li>
          Process payments, manage billing, and handle upgrades/downgrades;
        </li>
        <li>
          Communicate with you about security events, billing issues, changes to
          policies, and important product updates;
        </li>
        <li>
          Detect, investigate, and prevent fraud, abuse, and security incidents;
        </li>
        <li>
          Debug issues, optimize performance, and plan product improvements.
        </li>
      </ul>
      <p>We do not sell or rent your personal data to third parties.</p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your data only as long as necessary for the purposes described
        in this Policy, subject to legal requirements:
      </p>
      <ul>
        <li>
          <strong>Account data</strong> is kept while your Account is active. If
          you delete your Account, it is removed or anonymized after the
          deletion grace period, except for data we must keep for legal, tax, or
          security purposes.
        </li>
        <li>
          <strong>Project and content data</strong> is stored until the Project
          or Article is deleted, or until we delete it due to prolonged
          inactivity or plan limits, in line with our Terms of Service.
        </li>
        <li>
          <strong>Analytics data</strong> is stored for as long as the
          associated project and articles remain active, or until you delete
          them. Summarized aggregates may be kept longer in anonymized form.
        </li>
        <li>
          <strong>Billing records</strong> and invoices are kept for the
          retention period required by French/EU tax and accounting law
          (typically up to 7–10 years).
        </li>
        <li>
          <strong>Technical logs</strong> are kept for shorter periods (e.g.
          30–365 days), depending on the log type, then aggregated or deleted.
        </li>
      </ul>
      <p>
        Backups may contain copies of your data for a limited additional period
        until they are rotated or overwritten.
      </p>

      <h2>7. Sharing with Third Parties</h2>
      <p>
        We share limited data with trusted third-party processors who help us
        operate the Service, including:
      </p>
      <ul>
        <li>Cloud hosting providers (compute, database);</li>
        <li>Redis/caching providers for performance and API key caching;</li>
        <li>Object storage providers (e.g. Cloudflare R2) for file uploads;</li>
        <li>
          Email providers for sending transactional emails (verification,
          deletion, reminders);
        </li>
        <li>OAuth providers (Google, GitHub) for authentication;</li>
        <li>Stripe for payments and subscriptions.</li>
      </ul>
      <p>
        These providers process data on our behalf under contracts that require
        them to protect your data and comply with relevant privacy laws.
      </p>
      <p>We may also share data:</p>
      <ul>
        <li>When required by law, court order, or governmental authority;</li>
        <li>
          To enforce our Terms of Service or protect the rights, property, or
          safety of Simplist, our users, or the public;
        </li>
        <li>
          In connection with a business transaction (e.g. merger, acquisition),
          with appropriate safeguards.
        </li>
      </ul>

      <h2>8. International Data Transfers</h2>
      <p>
        Some of our infrastructure and providers may be located outside your
        country, including outside the EU/EEA. When personal data is transferred
        internationally, we rely on:
      </p>
      <ul>
        <li>European Commission adequacy decisions, where applicable;</li>
        <li>
          Standard Contractual Clauses (SCCs) or equivalent contractual
          safeguards;
        </li>
        <li>
          Provider commitments to GDPR-level protections and security practices.
        </li>
      </ul>

      <h2>9. Your Rights</h2>
      <p>
        If you are in the EU/EEA or a jurisdiction with similar privacy laws,
        you may have the following rights:
      </p>
      <ul>
        <li>
          <strong>Access:</strong> request a copy of the personal data we hold
          about you and information on how it is used.
        </li>
        <li>
          <strong>Rectification:</strong> correct inaccurate or incomplete
          personal data (you can also update many details in your account
          settings).
        </li>
        <li>
          <strong>Erasure:</strong> request deletion of your personal data where
          we are not required to keep it by law (for example, by deleting your
          account).
        </li>
        <li>
          <strong>Restriction:</strong> ask us to restrict processing while a
          dispute or request is being resolved.
        </li>
        <li>
          <strong>Portability:</strong> request your data in a structured,
          commonly used, machine-readable format.
        </li>
        <li>
          <strong>Objection:</strong> object to processing based on our
          legitimate interests, in certain circumstances.
        </li>
        <li>
          <strong>Withdrawal of consent:</strong> where processing is based on
          your consent, withdraw consent at any time (without affecting prior
          lawful processing).
        </li>
      </ul>
      <p>
        To exercise these rights, contact us at{" "}
        <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a>. We may
        need to verify your identity before acting on your request.
      </p>
      <p>
        You also have the right to lodge a complaint with your local data
        protection authority. In France, this is the{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
          CNIL
        </a>
        .
      </p>

      <h2>10. Security Measures</h2>
      <p>
        We implement technical and organizational measures to protect your data,
        including:
      </p>
      <ul>
        <li>
          Transport-layer encryption (HTTPS/TLS) for all dashboard and API
          traffic;
        </li>
        <li>Secure password hashing and secret storage;</li>
        <li>Access controls on databases and infrastructure;</li>
        <li>Rate-limiting and bot detection on public APIs;</li>
        <li>
          Regular security updates, dependency management, and monitoring.
        </li>
      </ul>
      <p>
        No system is perfectly secure. If we become aware of a personal data
        breach that is likely to result in a high risk to your rights and
        freedoms, we will notify you and the relevant authorities in accordance
        with legal requirements.
      </p>

      <h2>11. Cookies and Similar Technologies</h2>
      <p>
        Simplist uses limited first-party cookies and browser storage to provide
        essential functionality such as login sessions, CSRF protection, and
        basic UI preferences. We do not use third-party advertising cookies.
      </p>
      <p>
        For more details about the cookies we set and how to manage them, please
        see our <Link href="/legal/cookies">Cookie Policy</Link>.
      </p>

      <h2>12. Children&apos;s Privacy</h2>
      <p>
        The Service is not intended for children under 16. We do not knowingly
        collect personal data from children under 16. If you believe a child has
        created an account, please contact us so we can investigate and take
        appropriate action.
      </p>

      <h2>13. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we make
        material changes, we will update the &quot;Last Updated&quot; date at
        the top of this page and may also notify you via email or in-app
        notifications.
      </p>
      <p>
        Your continued use of the Service after the changes take effect
        constitutes your acceptance of them.
      </p>

      <h2>14. Contact</h2>
      <p>
        If you have any questions, concerns, or requests regarding this Privacy
        Policy or your personal data, please contact:
      </p>
      <p>
        <strong>Data Controller:</strong>
        <br />
        Gaëtan HUSZOVITS
        <br />
        Email: <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a>
      </p>

      <p className="mt-6 text-center font-medium">
        For additional legal information, see our{" "}
        <Link href="/legal/terms">Terms of Service</Link> and{" "}
        <Link href="/legal/gdpr">GDPR &amp; Data Protection</Link> pages.
      </p>
    </article>
  );
};

export default PrivacyPolicyPage;
