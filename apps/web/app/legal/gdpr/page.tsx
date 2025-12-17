import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GDPR & Data Protection",
  description: "GDPR and data protection information for Simplist.",
};

const GdprPage = () => {
  return (
    <article>
      <h1>GDPR &amp; Data Protection</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date:</strong> December 17, 2025
        <br />
        <strong>Last Updated:</strong> December 17, 2025
      </p>

      <h2>1. Purpose of This Page</h2>
      <p>
        This page explains how Simplist complies with the General Data Protection Regulation (GDPR) and similar
        data protection laws. It complements and should be read together with our{" "}
        <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
        <Link href="/legal/terms">Terms of Service</Link>.
      </p>

      <h2>2. GDPR Principles</h2>
      <p>We follow the core data protection principles set out in GDPR:</p>
      <ul>
        <li>
          <strong>Lawfulness, fairness, and transparency:</strong> we process data only where we have a valid
          legal basis and we explain our practices clearly.
        </li>
        <li>
          <strong>Purpose limitation:</strong> we collect data for specific, legitimate purposes and do not use it
          in ways that are incompatible with those purposes.
        </li>
        <li>
          <strong>Data minimization:</strong> we collect only the data that we need to provide and operate the
          Service.
        </li>
        <li>
          <strong>Accuracy:</strong> we keep personal data accurate and up to date where reasonably possible.
        </li>
        <li>
          <strong>Storage limitation:</strong> we retain personal data only for as long as needed for the stated
          purposes and legal requirements.
        </li>
        <li>
          <strong>Integrity and confidentiality:</strong> we implement appropriate security measures to protect
          data.
        </li>
        <li>
          <strong>Accountability:</strong> we maintain internal records and contracts with processors and can
          demonstrate compliance with GDPR.
        </li>
      </ul>

      <h2>3. Legal Bases and Typical Processing Activities</h2>
      <p>Examples of how we apply legal bases in practice include:</p>
      <ul>
        <li>
          <strong>Contract performance:</strong> creating and managing accounts, projects, articles, roles, and API
          access; providing analytics dashboards; sending necessary account emails (e.g. password reset, security
          notifications).
        </li>
        <li>
          <strong>Legitimate interests:</strong> protecting the Service from abuse, monitoring security,
          aggregating analytics, and improving product features.
        </li>
        <li>
          <strong>Legal obligations:</strong> retaining invoices, payment records, and certain logs for tax and
          accounting compliance.
        </li>
        <li>
          <strong>Consent:</strong> where required by law for non-essential tracking or when you explicitly enable
          certain optional features in your own integration.
        </li>
      </ul>

      <h2>4. Your Data Protection Rights</h2>
      <p>If you are in the EU/EEA or another region with similar rights, you have the following rights:</p>
      <ul>
        <li>
          <strong>Right of access:</strong> to know whether we process your personal data and to receive a copy.
        </li>
        <li>
          <strong>Right to rectification:</strong> to correct inaccurate or incomplete data.
        </li>
        <li>
          <strong>Right to erasure:</strong> to request deletion of your data in certain circumstances (for example
          by deleting your account).
        </li>
        <li>
          <strong>Right to restriction of processing:</strong> to request that we limit processing while a request
          or dispute is being resolved.
        </li>
        <li>
          <strong>Right to data portability:</strong> to receive your data in a structured, commonly used,
          machine-readable format where processing is based on consent or contract and done by automated means.
        </li>
        <li>
          <strong>Right to object:</strong> to object to processing based on our legitimate interests, in certain
          situations.
        </li>
        <li>
          <strong>Right to withdraw consent:</strong> where processing is based on consent, you can withdraw it at
          any time without affecting prior lawful processing.
        </li>
      </ul>
      <p>
        You can exercise many of these rights using features in the dashboard (for example, updating account
        information, deleting projects, or deleting your account). You can also contact us at{" "}
        <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a> with your request.
      </p>

      <h2>5. Processors and International Transfers</h2>
      <p>
        To provide the Service, we rely on service providers that act as processors for activities such as
        hosting, databases, caching, storage, email delivery, authentication, and payment processing. We enter
        into data processing agreements with these providers to ensure that:
      </p>
      <ul>
        <li>They process data only on our instructions;</li>
        <li>They implement appropriate technical and organizational measures;</li>
        <li>They assist us in meeting GDPR obligations, including data subject rights and breach notification;</li>
        <li>They delete or return data upon termination of their services, where applicable.</li>
      </ul>
      <p>
        Some processors may be located outside the EU/EEA. When personal data is transferred internationally, we
        rely on legal mechanisms such as Standard Contractual Clauses (SCCs) or adequacy decisions to protect your
        data.
      </p>

      <h2>6. Data Breach Response</h2>
      <p>
        We have procedures in place to detect, report, and investigate personal data breaches. If a breach is
        likely to result in a high risk to your rights and freedoms, we will:
      </p>
      <ul>
        <li>Notify the relevant supervisory authority without undue delay, where required by law; and</li>
        <li>
          Notify affected users without undue delay, describing the nature of the breach, likely consequences, and
          measures taken or proposed to address it.
        </li>
      </ul>

      <h2>7. Privacy by Design and by Default</h2>
      <p>We implement privacy by design and by default in Simplist by:</p>
      <ul>
        <li>Limiting the personal data we collect to what is necessary for the Service;</li>
        <li>
          Providing role-based access controls so that only authorized users can manage projects, members, and
          billing;
        </li>
        <li>Using pseudonymous identifiers in analytics instead of directly identifiable user data;</li>
        <li>Offering account and project deletion workflows from the dashboard;</li>
        <li>Avoiding third-party ad tracking cookies in the product.</li>
      </ul>

      <h2>8. Supervisory Authorities and Complaints</h2>
      <p>
        If you believe that your data protection rights have been violated, you have the right to lodge a complaint
        with your local data protection authority. In France, the supervisory authority is the CNIL:
      </p>
      <p>
        <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
          https://www.cnil.fr
        </a>
      </p>

      <h2>9. Contact</h2>
      <p>
        For questions about GDPR, data protection, or to exercise your rights, please contact our data protection
        contact:
      </p>
      <p>
        <strong>Data Protection Contact</strong>
        <br />
        Email: <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a>
      </p>

      <p className="mt-6 text-center font-medium">
        For more details on how we collect and handle data, please read the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
        <Link href="/legal/cookies">Cookie Policy</Link>.
      </p>
    </article>
  );
};

export default GdprPage;


