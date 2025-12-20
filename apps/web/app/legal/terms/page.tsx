import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for the Simplist headless CMS and analytics platform.",
};

const TermsOfServicePage = () => {
  return (
    <article>
      <h1>Terms of Service</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date:</strong> December 17, 2025
        <br />
        <strong>Last Updated:</strong> December 17, 2025
      </p>

      <h2>1. Introduction</h2>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of Simplist (&quot;Simplist&quot;, &quot;we&quot;, &quot;us&quot;, or
        &quot;our&quot;), a multi-tenant headless CMS and content analytics
        platform for blogs and technical documentation. The Service includes the
        SaaS dashboard at <code>app.simplist.blog</code>, the marketing website
        at <code>simplist.blog</code>, the REST API at{" "}
        <code>api.simplist.blog</code>, the official TypeScript SDK{" "}
        <code>@simplist.blog/sdk</code>, and any related tools and services
        (collectively, the &quot;Service&quot;).
      </p>
      <p>
        The Service is operated by <strong>Gaëtan HUSZOVITS</strong>, an
        independent contractor based in France (the &quot;Operator&quot;).
      </p>
      <p>
        By creating an account, accessing, or using any part of the Service, you
        agree to be bound by these Terms. If you do not agree to these Terms,
        you must not use the Service.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li>
          <strong>&quot;Account&quot;</strong> – your authenticated user profile
          in the Simplist dashboard.
        </li>
        <li>
          <strong>&quot;Project&quot;</strong> – a workspace in which you manage
          articles, tags, API keys, webhooks, settings, and analytics.
        </li>
        <li>
          <strong>&quot;Owner&quot;</strong> – the Project member with the
          special OWNER role and full rights, including billing and deletion.
        </li>
        <li>
          <strong>&quot;Member&quot;</strong> – any user who has joined a
          Project via invitation.
        </li>
        <li>
          <strong>&quot;Role&quot; / &quot;Project Role&quot;</strong> – a set
          of fine-grained permissions (for example: canManageProject,
          canManageMembers, canManageArticles, canManageApiKeys,
          canManageWebhooks, canViewAnalytics, canManageBilling,
          canDeleteProject).
        </li>
        <li>
          <strong>&quot;Content&quot;</strong> – all text, media, and metadata
          you store in Simplist, including articles, article variants, tags, and
          images.
        </li>
        <li>
          <strong>&quot;API&quot;</strong> – the REST API at{" "}
          <code>api.simplist.blog</code> and any programmatic access via the
          SDK.
        </li>
        <li>
          <strong>&quot;Free Plan&quot; / &quot;Starter&quot;</strong> – the
          no-cost plan with limited quotas and features.
        </li>
        <li>
          <strong>&quot;Pro Plan&quot; / &quot;PRO&quot;</strong> – the paid
          subscription plan with extended quotas and advanced features.
        </li>
      </ul>

      <h2>3. Eligibility and Account Registration</h2>
      <h3>3.1 Age and capacity</h3>
      <p>
        You must be at least <strong>16 years old</strong> and have the legal
        capacity to enter into a binding contract. If you use the Service on
        behalf of an organization, you represent that you have authority to bind
        that organization to these Terms.
      </p>

      <h3>3.2 Account creation and authentication</h3>
      <p>
        To use the dashboard, you must create an Account using at least one of
        the following methods:
      </p>
      <ul>
        <li>Email and password (stored only as a secure hash);</li>
        <li>OAuth via Google or GitHub;</li>
        <li>Passkeys (WebAuthn);</li>
        <li>Optional two-factor authentication (TOTP).</li>
      </ul>
      <p>
        You must provide a valid email address and keep your Account information
        accurate and up to date.
      </p>

      <h3>3.3 Account security</h3>
      <p>You are responsible for:</p>
      <ul>
        <li>
          Maintaining the confidentiality of your credentials and passkeys;
        </li>
        <li>All activity occurring under your Account;</li>
        <li>Promptly notifying us of any suspected unauthorized access.</li>
      </ul>

      <h3>3.4 One Account per individual</h3>
      <p>
        You must not share your personal Account with other individuals.
        Projects support collaboration via invitations and roles so that each
        collaborator has their own Account.
      </p>

      <h2>4. Projects, Roles, and Members</h2>
      <h3>4.1 Projects</h3>
      <p>
        Projects are the primary organizational unit in Simplist. Within a
        Project you can manage articles, tags, analytics, API keys, webhooks,
        settings (slug, icon, color, avatar, allowed origins, base URL, article
        URL pattern, default language), and members.
      </p>

      <h3>4.2 Roles and permissions</h3>
      <p>
        Each Project has configurable roles with granular permissions. The OWNER
        role always has full access, including billing and deletion, and is the
        only role allowed to transfer ownership.
      </p>

      <h3>4.3 Membership and invitations</h3>
      <p>
        Members join a Project through invitations sent to their email address.
        Invitations are scoped to one Project and one role, have an expiration
        date, and can be revoked before acceptance. A Member can leave a Project
        at any time, except that the Owner must first transfer ownership.
      </p>

      <h3>4.4 Project deletion (danger zone)</h3>
      <p>
        Only users with <strong>canDeleteProject</strong> may permanently delete
        a Project. Deletion is initiated from the Project settings and requires
        explicit confirmation of the Project slug.
      </p>
      <p>When a Project is deleted:</p>
      <ul>
        <li>
          All articles and article variants for that Project are permanently
          removed;
        </li>
        <li>
          All associated analytics records (page views, events, aggregates) are
          removed;
        </li>
        <li>All API keys are marked deleted and immediately stop working;</li>
        <li>
          All tags, webhooks, roles, members, and invitations for that Project
          are removed;
        </li>
        <li>
          Caches and temporary data for that Project are invalidated and expire
          shortly after.
        </li>
      </ul>
      <p>
        Project deletion is <strong>irreversible</strong>. You are responsible
        for exporting any data you need before deleting a Project.
      </p>

      <h2>5. Acceptable Use and Content</h2>
      <h3>5.1 Acceptable use</h3>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Violate any applicable law or regulation;</li>
        <li>
          Infringe the intellectual property, privacy, or other rights of third
          parties;
        </li>
        <li>
          Publish content that is unlawful, hateful, harassing, or obscene;
        </li>
        <li>
          Upload malware or code designed to disrupt or compromise systems;
        </li>
        <li>Attempt to gain unauthorized access to any systems or data;</li>
        <li>Bypass rate limits, quotas, or security controls;</li>
        <li>
          Scrape or crawl the Service in a way that overloads infrastructure;
        </li>
        <li>
          Use the Service for high-risk applications where failure could lead to
          injury or serious harm.
        </li>
      </ul>

      <h3>5.2 Content responsibility</h3>
      <p>
        You are solely responsible for Content you create, host, or distribute
        through the Service, including via the API and webhooks. We do not
        proactively moderate or pre-approve Content, but we may remove or
        restrict Content that we reasonably believe violates these Terms,
        infringes rights, or poses a risk.
      </p>

      <h3>5.3 Intellectual property</h3>
      <p>
        You retain ownership of your Content. You grant Simplist a worldwide,
        non-exclusive, royalty-free license to host, store, reproduce, and
        transmit your Content as necessary to operate, maintain, back up, and
        improve the Service.
      </p>
      <p>
        All rights in the Service itself (including software, UI, documentation,
        and branding) are owned by the Operator and its licensors. You receive a
        limited, revocable, non-transferable license to use the Service in
        accordance with these Terms.
      </p>

      <h2>6. Plans, Quotas, and Features</h2>
      <h3>6.1 Free (Starter) plan</h3>
      <p>
        The Starter plan is designed for side projects, small blogs, and
        evaluation. Per Project it typically includes:
      </p>
      <ul>
        <li>Up to 5 active articles;</li>
        <li>Up to 50 MB of image storage;</li>
        <li>Up to 1,000 API calls per month;</li>
        <li>One member (Owner only);</li>
        <li>Limited analytics features;</li>
        <li>No article language variants or bulk operations.</li>
      </ul>

      <h3>6.2 Pro plan</h3>
      <p>
        The Pro plan is designed for professional and production use. Per
        Project it typically includes:
      </p>
      <ul>
        <li>Unlimited articles (subject to fair use);</li>
        <li>Up to 1 GB of image storage;</li>
        <li>Up to 500,000 API calls per month;</li>
        <li>Up to 10 members;</li>
        <li>Full analytics dashboards and statistics;</li>
        <li>Article language variants and per-variant cover images;</li>
        <li>Scheduled publishing with automatic cron-based publishing;</li>
        <li>Bulk operations and extended webhook capacity.</li>
      </ul>
      <p>
        Current plan limits and prices are displayed on the{" "}
        <Link href="/pricing">pricing page</Link> and may be updated over time.
      </p>

      <h3>6.3 Quota enforcement</h3>
      <p>
        The Service tracks quotas for each Project (articles, members, storage,
        monthly API calls). When quotas are exceeded, we may reject new API
        calls, block new article creation or variants, block adding members, or
        disable features such as bulk operations until usage is back within
        limits or the plan is upgraded.
      </p>

      <h2>7. Public API, SDK, and API Keys</h2>
      <h3>7.1 API authentication</h3>
      <p>
        The REST API at <code>api.simplist.blog</code> is authenticated using
        API keys sent in the <code>X-API-Key</code> header. All API access must
        occur over HTTPS.
      </p>

      <h3>7.2 API key management</h3>
      <p>
        Within each Project, members with <strong>canManageApiKeys</strong> can
        create API keys with specific permissions (e.g. <code>read</code>,{" "}
        <code>analytics</code>), set optional expirations, and revoke keys when
        no longer needed.
      </p>
      <p>You are responsible for:</p>
      <ul>
        <li>Keeping API keys confidential and storing them securely;</li>
        <li>
          Not embedding secret keys in public repositories or client-side code;
        </li>
        <li>Rotating keys promptly if you suspect compromise;</li>
        <li>Configuring CORS and allowed origins appropriately.</li>
      </ul>

      <h3>7.3 Rate limiting and quotas</h3>
      <p>
        API usage is subject to per-key and per-Project rate limits as well as
        monthly quotas based on your plan. We may temporarily or permanently
        throttle or revoke keys that abuse or threaten the stability or security
        of the Service.
      </p>

      <h3>7.4 SDK usage</h3>
      <p>
        The official TypeScript SDK <code>@simplist.blog/sdk</code> is a
        convenience wrapper over the REST API. Using the SDK does not change
        your responsibilities under these Terms or the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2>8. Analytics, Logs, and Webhooks</h2>
      <h3>8.1 Visitor analytics</h3>
      <p>
        When analytics are enabled and integrated on your site, Simplist records
        pseudonymous analytics about visitors to your articles, including
        browser and device information, derived geographic region, referrer and
        UTM parameters, and engagement metrics (time on page, scroll depth, exit
        position, events).
      </p>
      <p>
        Analytics are designed to be privacy-friendly and do not intentionally
        attach directly identified user accounts to visitor records by default.
        For details about what is collected and how long it is stored, see the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
        <Link href="/legal/gdpr">GDPR &amp; Data Protection</Link> pages.
      </p>

      <h3>8.2 Operational logs and audit trails</h3>
      <p>
        To secure and operate the Service we maintain internal logs and
        audit-like records, such as who created or updated an article,
        membership history, invitation status, API key metadata, webhook
        deliveries, and scheduler activity (for example, scheduled publishing
        and account deletion processes).
      </p>

      <h3>8.3 Webhooks</h3>
      <p>
        Eligible Projects can configure outgoing webhooks for events like{" "}
        <code>article.published</code>, <code>article.scheduled</code>,{" "}
        <code>article.updated</code>, and <code>article.deleted</code>. You are
        responsible for:
      </p>
      <ul>
        <li>Configuring secure webhook URLs and secrets;</li>
        <li>Validating signatures or authenticity where applicable;</li>
        <li>Handling retries and idempotency on your side.</li>
      </ul>

      <h2>9. Billing, Payments, and Taxes</h2>
      <h3>9.1 Billing provider</h3>
      <p>
        Subscriptions are processed by <strong>Stripe</strong>. Stripe stores
        and processes your payment method details under its own terms and
        privacy policy. We receive only limited billing identifiers such as
        customer and subscription IDs, status, and basic metadata.
      </p>

      <h3>9.2 Subscription cycles and auto-renewal</h3>
      <p>
        Pro subscriptions may be billed monthly or annually and renew
        automatically unless canceled before the end of the current billing
        period. The then-current price and applicable taxes are displayed before
        checkout.
      </p>

      <h3>9.3 Plan changes and cancellations</h3>
      <ul>
        <li>
          You can upgrade from Free to Pro at any time; Stripe handles charges
          and proration.
        </li>
        <li>
          You can downgrade or cancel Pro effective at the end of the current
          billing period via the dashboard or Stripe billing portal.
        </li>
        <li>
          When downgrading to Free, Content or usage above Free limits may
          become inaccessible but is generally not immediately deleted.
        </li>
      </ul>

      <h3>9.4 Failed payments</h3>
      <p>
        If Stripe cannot charge your payment method, it may retry over a grace
        period. If payment ultimately fails, we may suspend Pro features and
        treat the Project as if it were on the Free plan until payment issues
        are resolved.
      </p>

      <h3>9.5 Refunds</h3>
      <p>
        Except where required by law, subscription fees are non-refundable. In
        exceptional cases (for example, extended outages caused by us or clear
        billing errors), we may grant partial or full refunds at our discretion.
        Refund requests must be submitted to{" "}
        <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a> within
        30 days of the charge.
      </p>

      <h3>9.6 Taxes</h3>
      <p>
        Fees are displayed exclusive of VAT, sales tax, or similar taxes, which
        may be added and collected by Stripe based on your billing address. You
        are responsible for any bank or currency conversion fees.
      </p>

      <h2>10. Account Deletion and User-Initiated Termination</h2>
      <h3>10.1 Deletion workflow</h3>
      <p>
        You may request deletion of your Account from the account settings page.
        When you confirm deletion, a deletion date is scheduled (currently 14
        days in the future). During this grace period:
      </p>
      <ul>
        <li>You may receive reminder emails;</li>
        <li>You may sign back in and cancel the deletion;</li>
        <li>Your Account is marked as pending deletion but not yet removed.</li>
      </ul>
      <p>
        If you do not cancel by the scheduled date, your Account is permanently
        deleted and associated user data is removed or anonymized, subject to
        legal retention obligations described in the Privacy Policy.
      </p>

      <h3>10.2 Ownership preconditions</h3>
      <p>
        If you are the Owner of one or more Projects, you must transfer
        ownership or delete those Projects before scheduling Account deletion.
        This prevents orphaned Projects and protects other members.
      </p>

      <h3>10.3 Effect of Account deletion</h3>
      <p>Once your Account is permanently deleted:</p>
      <ul>
        <li>
          Your user profile and authentication data are removed from our primary
          database;
        </li>
        <li>Your memberships in Projects are removed;</li>
        <li>
          Any Projects still owned solely by you may be suspended or deleted
          according to internal safety policies;
        </li>
        <li>
          Certain billing and audit records may be retained in line with legal,
          tax, or security retention obligations.
        </li>
      </ul>

      <h2>11. Termination by Simplist</h2>
      <p>
        We may suspend or terminate your Account or access to all or part of the
        Service if we reasonably believe that:
      </p>
      <ul>
        <li>You have materially breached these Terms or applicable law;</li>
        <li>
          Your use of the Service poses a security, legal, or reputational risk;
        </li>
        <li>
          Your subscriptions remain unpaid beyond a reasonable grace period;
        </li>
        <li>We are required to do so by law or court order.</li>
      </ul>
      <p>
        Where reasonable, we will provide notice before termination. In urgent
        security or abuse scenarios, we may act without prior notice.
      </p>

      <h2>12. Disclaimers and Limitations of Liability</h2>
      <h3>12.1 Disclaimers</h3>
      <p>
        The Service is provided on an &quot;AS IS&quot; and &quot;AS
        AVAILABLE&quot; basis, without warranties of any kind, whether express
        or implied, including but not limited to warranties of merchantability,
        fitness for a particular purpose, non-infringement, or availability.
      </p>
      <p>
        We do not warrant that the Service will be error-free, secure, or
        uninterrupted, or that any defects will be corrected, nor do we
        guarantee that your Content will not be lost.
      </p>

      <h3>12.2 Limitation of liability</h3>
      <p>
        To the fullest extent permitted by law, in no event shall the Operator
        be liable for any indirect, incidental, special, consequential, or
        punitive damages, or for any loss of profits, revenues, data, goodwill,
        or other intangible losses, arising out of or related to your use of or
        inability to use the Service.
      </p>
      <p>
        In all cases, our total aggregate liability for all claims related to
        the Service shall not exceed the greater of (a) the amounts you paid to
        us for the Service in the twelve (12) months preceding the event giving
        rise to the claim, or (b) one hundred euros (€100) for Free users and
        five hundred euros (€500) for paying users.
      </p>

      <h3>12.3 Indemnification</h3>
      <p>
        You agree to indemnify and hold harmless the Operator from and against
        any claims, damages, losses, liabilities, and expenses (including
        reasonable legal fees) arising out of or related to your use of the
        Service, your Content, or your violation of these Terms.
      </p>

      <h2>13. Data Protection and Privacy</h2>
      <p>
        Our collection and use of personal data is described in detail in the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>, the{" "}
        <Link href="/legal/cookies">Cookie Policy</Link>, and the{" "}
        <Link href="/legal/gdpr">GDPR &amp; Data Protection</Link> page. Those
        documents are incorporated into these Terms by reference. In case of
        conflict regarding data protection, those documents prevail.
      </p>

      <h2>14. Governing Law and Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of <strong>France</strong>, without
        regard to its conflict of laws rules. Any dispute arising out of or
        relating to these Terms or the Service shall be subject to the exclusive
        jurisdiction of the competent courts located in France, except where
        mandatory law grants you the right to bring claims in another
        jurisdiction.
      </p>

      <h2>15. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. When we make material
        changes, we will update the &quot;Last Updated&quot; date and may
        provide additional notice via email or in-app notifications. Your
        continued use of the Service after the changes become effective
        constitutes your acceptance of the updated Terms.
      </p>

      <h2>16. Miscellaneous</h2>
      <p>
        If any provision of these Terms is held invalid or unenforceable, the
        remaining provisions will remain in full force and effect. Our failure
        to enforce any right or provision will not be deemed a waiver of such
        right or provision. These Terms, together with the Privacy Policy and
        any applicable enterprise agreements, constitute the entire agreement
        between you and us regarding the Service.
      </p>

      <h2>17. Contact</h2>
      <p>
        If you have questions about these Terms or the Service, you can contact:
      </p>
      <p>
        <strong>Gaëtan HUSZOVITS</strong>
        <br />
        Email: <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a>
        <br />
        Website: <a href="https://simplist.blog">https://simplist.blog</a>
      </p>

      <hr className="my-8" />
      <p className="text-center font-medium">
        By using Simplist, you acknowledge that you have read, understood, and
        agree to be bound by these Terms of Service.
      </p>
    </article>
  );
};

export default TermsOfServicePage;
