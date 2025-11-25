import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GDPR Compliance & User Rights",
  description: "GDPR Compliance documentation and user rights for Simplist",
};

const GDPRCompliancePage = () => {
  return (
    <article className="prose max-w-none">
      <h1>GDPR Compliance & User Rights</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date:</strong> October 22, 2025<br />
        <strong>Last Updated:</strong> October 22, 2025
      </p>

      <h2>1. Introduction</h2>
      <p>
        This document outlines how Simplist complies with the <strong>General Data Protection Regulation (GDPR)</strong> (EU Regulation 2016/679) and explains your rights as a data subject in the European Economic Area (EEA).
      </p>
      <p>
        Simplist is operated by <strong>Gaëtan HUSZOVITS</strong>, an independent contractor based in France, and processes personal data in accordance with GDPR principles.
      </p>
      <p>
        For general privacy information, see our <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2>2. GDPR Principles</h2>
      <p>Simplist adheres to the following GDPR principles (Art. 5):</p>

      <h3>2.1 Lawfulness, Fairness, and Transparency</h3>
      <p>We process your data lawfully, fairly, and in a transparent manner. We clearly inform you:</p>
      <ul>
        <li>What data we collect</li>
        <li>Why we collect it</li>
        <li>How we use it</li>
        <li>Who we share it with</li>
      </ul>

      <h3>2.2 Purpose Limitation</h3>
      <p>We collect data only for specified, explicit, and legitimate purposes:</p>
      <ul>
        <li><strong>Account management</strong>: To provide your Simplist account</li>
        <li><strong>Authentication</strong>: To verify your identity</li>
        <li><strong>Content hosting</strong>: To store and serve your blog articles</li>
        <li><strong>Analytics</strong>: To track visitor engagement on your published content</li>
        <li><strong>Security</strong>: To prevent fraud and abuse</li>
      </ul>
      <p>We do NOT use your data for purposes incompatible with those stated.</p>

      <h3>2.3 Data Minimization</h3>
      <p>We collect only the data necessary for each purpose:</p>
      <ul>
        <li><strong>Required data</strong>: Email, password/OAuth credentials</li>
        <li><strong>Optional data</strong>: Name, profile image</li>
        <li><strong>Automatically collected</strong>: Session data, analytics (anonymized)</li>
      </ul>
      <p>We do NOT collect unnecessary personal information.</p>

      <h3>2.4 Accuracy</h3>
      <p>We take reasonable steps to ensure data accuracy:</p>
      <ul>
        <li>You can update your account information at any time</li>
        <li>You can request corrections via privacy@simplist.blog</li>
      </ul>

      <h3>2.5 Storage Limitation</h3>
      <p>We retain data only as long as necessary:</p>
      <ul>
        <li><strong>Account data</strong>: Until you delete your account</li>
        <li><strong>Analytics data</strong>: Until you delete your project or account</li>
        <li><strong>Session data</strong>: Until session expires</li>
        <li><strong>Cache data</strong>: 5 minutes (automatic expiration)</li>
        <li><strong>Backup data</strong>: Up to 90 days after deletion</li>
      </ul>

      <h3>2.6 Integrity and Confidentiality</h3>
      <p>We implement appropriate security measures:</p>
      <ul>
        <li>Encryption in transit (TLS/SSL)</li>
        <li>Encryption at rest (database encryption)</li>
        <li>Password hashing (bcrypt)</li>
        <li>Access controls and authentication</li>
        <li>Regular security audits</li>
      </ul>

      <h3>2.7 Accountability</h3>
      <p>We demonstrate compliance through:</p>
      <ul>
        <li>This GDPR Compliance Document</li>
        <li>Data Processing Records</li>
        <li>Privacy Impact Assessments (when applicable)</li>
        <li>Contracts with data processors (third-party services)</li>
      </ul>

      <h2>3. Legal Basis for Processing (Art. 6)</h2>
      <p>We process your personal data under the following legal bases:</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Processing Activity</th>
              <th>Legal Basis</th>
              <th>GDPR Article</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account creation and management</td>
              <td>Contract performance</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Authentication (email/password, OAuth)</td>
              <td>Contract performance</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Session management</td>
              <td>Contract performance</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Content storage (articles, images)</td>
              <td>Contract performance</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>API key generation and validation</td>
              <td>Contract performance</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Security monitoring (fraud prevention)</td>
              <td>Legitimate interest</td>
              <td>Art. 6(1)(f)</td>
            </tr>
            <tr>
              <td>Service improvement (error logs, usage analytics)</td>
              <td>Legitimate interest</td>
              <td>Art. 6(1)(f)</td>
            </tr>
            <tr>
              <td>Visitor analytics (anonymized)</td>
              <td>Legitimate interest / Consent</td>
              <td>Art. 6(1)(f) or Art. 6(1)(a)</td>
            </tr>
            <tr>
              <td>Payment processing and billing</td>
              <td>Contract performance</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Subscription management</td>
              <td>Contract performance</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Usage tracking and quota enforcement</td>
              <td>Contract performance</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Tax reporting and compliance</td>
              <td>Legal obligation</td>
              <td>Art. 6(1)(c)</td>
            </tr>
            <tr>
              <td>Legal compliance (data breach reporting)</td>
              <td>Legal obligation</td>
              <td>Art. 6(1)(c)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-muted p-4 rounded-lg mt-4">
        <h4 className="font-semibold mb-2">Legitimate Interest Assessments:</h4>
        <ul className="space-y-2">
          <li><strong>Security monitoring</strong>: Necessary to protect the Service and users from fraud, abuse, and unauthorized access</li>
          <li><strong>Service improvement</strong>: Helps us fix bugs and optimize performance without identifying individual users</li>
          <li><strong>Visitor analytics</strong>: Provides content creators (you) with insights into article performance using anonymized data</li>
        </ul>
      </div>

      <h2>4. Your Rights Under GDPR</h2>
      <p>As a data subject in the EEA, you have the following rights:</p>

      <h3>4.1 Right of Access (Art. 15)</h3>
      <p><strong>What it means:</strong></p>
      <p>You have the right to obtain confirmation that we process your personal data and to receive a copy of that data.</p>

      <p><strong>What we provide:</strong></p>
      <ul>
        <li>All personal data we hold about you</li>
        <li>Information about how we use it</li>
        <li>Who we share it with</li>
        <li>How long we retain it</li>
      </ul>

      <p><strong>How to request:</strong></p>
      <p>Email <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a> with subject: <strong>&ldquo;Data Access Request&rdquo;</strong></p>

      <p>Include:</p>
      <ul>
        <li>Your full name</li>
        <li>Email address associated with your account</li>
        <li>Any specific data categories you want to access</li>
      </ul>

      <p><strong>Response time:</strong> Within <strong>30 days</strong> (may be extended to 60 days for complex requests)</p>
      <p><strong>Format:</strong> JSON export containing all your data</p>

      <h3>4.2 Right to Rectification (Art. 16)</h3>
      <p><strong>What it means:</strong></p>
      <p>You have the right to correct inaccurate or incomplete personal data.</p>

      <p><strong>How to exercise:</strong></p>
      <ul>
        <li><strong>Option 1</strong>: Update your information directly in account settings</li>
        <li><strong>Option 2</strong>: Email <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a> with subject: <strong>&ldquo;Data Correction Request&rdquo;</strong></li>
      </ul>

      <p><strong>Examples:</strong></p>
      <ul>
        <li>Update your name or email address</li>
        <li>Correct project or article information</li>
        <li>Update profile image</li>
      </ul>

      <p><strong>Response time:</strong> Immediate (via settings) or within 30 days (via email)</p>

      <h3>4.3 Right to Erasure / &ldquo;Right to be Forgotten&rdquo; (Art. 17)</h3>
      <p><strong>What it means:</strong></p>
      <p>You have the right to request deletion of your personal data.</p>

      <p><strong>When this applies:</strong></p>
      <ul>
        <li>You no longer wish to use Simplist</li>
        <li>You withdraw consent for data processing</li>
        <li>Your data is no longer necessary for the purposes collected</li>
        <li>You object to processing based on legitimate interests</li>
      </ul>
      
      <p><strong>Billing Data Exception:</strong></p>
      <ul>
        <li>Billing and payment data may be retained for <strong>7 years</strong> after subscription ends due to tax and legal requirements</li>
        <li>This data will be anonymized where possible while maintaining legal compliance</li>
        <li>You can request deletion after the legal retention period expires</li>
      </ul>

      <p><strong>How to exercise:</strong></p>
      <ul>
        <li><strong>Option 1</strong>: Delete your account via <strong>Account Settings</strong> page (immediate deletion)</li>
        <li><strong>Option 2</strong>: Email <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a> with subject: <strong>&ldquo;Account Deletion Request&rdquo;</strong></li>
      </ul>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
        <p className="font-semibold mb-2">What happens:</p>
        <ol>
          <li>Your account is immediately deactivated</li>
          <li>All associated data is deleted:
            <ul>
              <li>Projects, articles, API keys</li>
              <li>Analytics data (page views, events)</li>
              <li>Uploaded images</li>
              <li>Session data</li>
            </ul>
          </li>
          <li>Deletion is completed within <strong>30 days</strong></li>
          <li>Backups are purged within <strong>90 days</strong></li>
        </ol>

        <p className="font-semibold mt-4 text-amber-700 dark:text-amber-400">
          Important: Deletion is <strong>permanent and irreversible</strong>. Billing data may be retained for legal compliance (see above).
        </p>
      </div>

      <p><strong>Exceptions:</strong></p>
      <p>We may retain data if required by law (e.g., financial records, legal disputes).</p>

      <h3>4.4 Right to Restriction of Processing (Art. 18)</h3>
      <p><strong>What it means:</strong></p>
      <p>You can request that we limit how we use your data while a dispute or request is being resolved.</p>

      <p><strong>When this applies:</strong></p>
      <ul>
        <li>You contest the accuracy of your data</li>
        <li>Processing is unlawful, but you don&apos;t want deletion</li>
        <li>We no longer need the data, but you need it for legal claims</li>
        <li>You&apos;ve objected to processing while we verify legitimate grounds</li>
      </ul>

      <p><strong>How to exercise:</strong></p>
      <p>Email <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a> with subject: <strong>&ldquo;Restriction Request&rdquo;</strong></p>

      <h3>4.5 Right to Data Portability (Art. 20)</h3>
      <p><strong>What it means:</strong></p>
      <p>You have the right to receive your data in a structured, machine-readable format and transmit it to another service.</p>

      <p><strong>What we provide:</strong></p>
      <p>JSON export of all your personal data:</p>
      <ul>
        <li>Account information</li>
        <li>Projects and articles (including Markdown content)</li>
        <li>API keys</li>
        <li>Analytics data (aggregated)</li>
        <li>Image references</li>
      </ul>

      <p><strong>How to request:</strong></p>
      <p>Email <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a> with subject: <strong>&ldquo;Data Portability Request&rdquo;</strong></p>

      <p><strong>Response time:</strong> Within 30 days</p>
      <p><strong>Format:</strong> JSON file sent via encrypted email or secure download link</p>

      <h3>4.6 Right to Object (Art. 21)</h3>
      <p><strong>What it means:</strong></p>
      <p>You can object to processing based on legitimate interests or for direct marketing.</p>

      <p><strong>When this applies:</strong></p>
      <ul>
        <li>You object to analytics tracking on your published articles</li>
        <li>You object to service improvement analytics (error logs, usage data)</li>
        <li>You object to security monitoring (may result in account suspension)</li>
      </ul>

      <p><strong>How to exercise:</strong></p>
      <p>Email <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a> with subject: <strong>&ldquo;Objection to Processing&rdquo;</strong></p>

      <h3>4.7 Right to Withdraw Consent (Art. 7(3))</h3>
      <p><strong>What it means:</strong></p>
      <p>Where processing is based on consent, you can withdraw that consent at any time.</p>

      <p><strong>When this applies:</strong></p>
      <ul>
        <li>Visitor analytics on your published articles (if consent-based)</li>
        <li>Optional features requiring explicit consent</li>
      </ul>

      <p><strong>Effect:</strong></p>
      <ul>
        <li>Withdrawal does not affect the lawfulness of past processing</li>
        <li>We will stop processing based on consent going forward</li>
      </ul>

      <h3>4.8 Right Not to Be Subject to Automated Decision-Making (Art. 22)</h3>
      <p><strong>What it means:</strong></p>
      <p>You have the right not to be subject to decisions based solely on automated processing that significantly affect you.</p>

      <p><strong>Our practices:</strong></p>
      <ul>
        <li>Simplist does <strong>NOT</strong> use automated decision-making or profiling</li>
        <li>All account-related decisions (e.g., account suspension) involve human review</li>
      </ul>

      <h3>4.9 Right to Lodge a Complaint (Art. 77)</h3>
      <p><strong>What it means:</strong></p>
      <p>You have the right to file a complaint with a data protection authority if you believe we have violated your GDPR rights.</p>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <p className="font-semibold mb-2">Supervisory Authority (France):</p>
        <p>
          <strong>Commission Nationale de l&apos;Informatique et des Libertés (CNIL)</strong><br />
          Address: 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France<br />
          Website: <a href="https://www.cnil.fr/en/home" target="_blank" rel="noopener noreferrer">www.cnil.fr/en/home</a><br />
          Online complaint form: <a href="https://www.cnil.fr/en/plaintes" target="_blank" rel="noopener noreferrer">www.cnil.fr/en/plaintes</a>
        </p>
        <p className="mt-2 text-sm">
          <strong>Your Local Authority:</strong> You may also contact the supervisory authority in your EU/EEA country of residence.
        </p>
      </div>

      <h2>5. Data Processing Records</h2>
      <p>In accordance with Art. 30 GDPR, we maintain records of processing activities:</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Processing Activity</th>
              <th>Purpose</th>
              <th>Data Categories</th>
              <th>Recipients</th>
              <th>Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>User registration</td>
              <td>Account creation</td>
              <td>Email, name, password/OAuth</td>
              <td>Neon (DB), Google/GitHub (OAuth)</td>
              <td>Until account deletion</td>
            </tr>
            <tr>
              <td>Session management</td>
              <td>Authentication</td>
              <td>Session tokens, IP, user agent</td>
              <td>Neon (DB)</td>
              <td>Until session expires</td>
            </tr>
            <tr>
              <td>Content management</td>
              <td>Blog hosting</td>
              <td>Articles, images, project data</td>
              <td>Neon (DB), Cloudflare R2</td>
              <td>Until deletion by user</td>
            </tr>
            <tr>
              <td>API key management</td>
              <td>API access</td>
              <td>Key values, permissions, metadata</td>
              <td>Neon (DB), Upstash (cache)</td>
              <td>Until revoked or account deleted</td>
            </tr>
            <tr>
              <td>Visitor analytics</td>
              <td>Article insights</td>
              <td>Anonymized visitor data, engagement metrics</td>
              <td>Neon (DB), Upstash (cache)</td>
              <td>Until project/account deletion</td>
            </tr>
            <tr>
              <td>Payment processing</td>
              <td>Subscription billing</td>
              <td>Stripe customer ID, subscription data, billing address</td>
              <td>Stripe, Neon (DB)</td>
              <td>7 years after subscription ends</td>
            </tr>
            <tr>
              <td>Usage tracking</td>
              <td>Quota enforcement</td>
              <td>API call counts, storage usage, feature usage</td>
              <td>Neon (DB)</td>
              <td>Until account deletion or 2 years</td>
            </tr>
            <tr>
              <td>Security logs</td>
              <td>Fraud prevention</td>
              <td>IP addresses (session-level), error logs</td>
              <td>Neon (DB)</td>
              <td>90 days</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>6. Data Processors and Transfers</h2>

      <h3>6.1 Third-Party Processors</h3>
      <p>We use the following data processors (Art. 28 GDPR):</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Processor</th>
              <th>Service</th>
              <th>Data Processed</th>
              <th>Location</th>
              <th>Safeguards</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Neon (AWS)</td>
              <td>PostgreSQL hosting</td>
              <td>All user data</td>
              <td>EU (Frankfurt)</td>
              <td>EU-based, GDPR-compliant</td>
            </tr>
            <tr>
              <td>Upstash</td>
              <td>Redis caching</td>
              <td>API keys, analytics (cached)</td>
              <td>US (primary), EU (replicas)</td>
              <td>Standard Contractual Clauses (SCCs)</td>
            </tr>
            <tr>
              <td>Cloudflare R2</td>
              <td>File storage</td>
              <td>Uploaded images</td>
              <td>EU (WEUR)</td>
              <td>EU-based, GDPR-compliant</td>
            </tr>
            <tr>
              <td>Google</td>
              <td>OAuth authentication</td>
              <td>Email, name, profile image</td>
              <td>Global</td>
              <td>Privacy Shield successor (adequacy decision)</td>
            </tr>
            <tr>
              <td>GitHub</td>
              <td>OAuth authentication</td>
              <td>Email, name, profile image</td>
              <td>Global</td>
              <td>Privacy Shield successor (adequacy decision)</td>
            </tr>
            <tr>
              <td>Stripe</td>
              <td>Payment processing</td>
              <td>Billing info, payment methods, transaction data</td>
              <td>US (primary), EU (Ireland)</td>
              <td>EU adequacy decision, Standard Contractual Clauses</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4">All processors are contractually bound to:</p>
      <ul>
        <li>Process data only on our instructions</li>
        <li>Implement appropriate security measures</li>
        <li>Assist with data subject requests</li>
        <li>Notify us of data breaches</li>
        <li>Delete data upon termination</li>
      </ul>

      <h3>6.2 International Data Transfers</h3>
      <p><strong>Transfers outside the EEA:</strong></p>
      <ul>
        <li><strong>Upstash</strong> (US primary region): Protected by <strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
        <li><strong>Google/GitHub OAuth</strong>: Protected by adequacy decisions or SCCs</li>
        <li><strong>Stripe</strong> (US parent company): Protected by <strong>EU adequacy decision</strong> and Standard Contractual Clauses for enhanced protection</li>
      </ul>

      <p><strong>EU Data Residency:</strong></p>
      <ul>
        <li>Primary database (Neon): <strong>EU (Frankfurt)</strong></li>
        <li>File storage (Cloudflare R2): <strong>EU (WEUR)</strong></li>
        <li>API infrastructure: <strong>EU West</strong></li>
        <li>Payment processing (Stripe): <strong>EU operations via Ireland, with US parent company protections</strong></li>
      </ul>

      <h2>7. Data Breach Notification (Art. 33-34)</h2>

      <h3>7.1 Our Obligations</h3>
      <p>In the event of a data breach:</p>

      <p><strong>To Supervisory Authority (CNIL):</strong></p>
      <ul>
        <li>Notification within <strong>72 hours</strong> of discovery (Art. 33)</li>
        <li>Description of the breach, affected data, and mitigation measures</li>
      </ul>

      <p><strong>To Data Subjects (You):</strong></p>
      <ul>
        <li>Notification <strong>without undue delay</strong> if breach poses high risk to your rights (Art. 34)</li>
        <li>Email notification to your registered email address</li>
        <li>Description of the breach, likely consequences, and measures taken</li>
      </ul>

      <h3>7.2 What We Monitor</h3>
      <ul>
        <li>Unauthorized access to databases</li>
        <li>Data exfiltration or leaks</li>
        <li>Ransomware or malware attacks</li>
        <li>Accidental data exposure</li>
        <li>Third-party processor breaches</li>
      </ul>

      <h3>7.3 Your Actions</h3>
      <p>If you suspect a breach (e.g., unauthorized access to your account):</p>
      <ol>
        <li>Change your password immediately</li>
        <li>Revoke API keys</li>
        <li>Contact <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a></li>
      </ol>

      <h2>8. Privacy by Design and by Default (Art. 25)</h2>
      <p>Simplist implements privacy-focused design principles:</p>

      <h3>8.1 Privacy by Design</h3>
      <ul>
        <li><strong>Data minimization</strong>: We collect only necessary data</li>
        <li><strong>Anonymization</strong>: Visitor IPs are hashed, not stored</li>
        <li><strong>Encryption</strong>: TLS/SSL in transit, encryption at rest</li>
        <li><strong>Access controls</strong>: Authentication required for all admin features</li>
      </ul>

      <h3>8.2 Privacy by Default</h3>
      <ul>
        <li><strong>Minimal data collection</strong>: No marketing emails, no third-party trackers</li>
        <li><strong>Secure defaults</strong>: API keys require explicit permissions</li>
        <li><strong>Bot filtering</strong>: Automated traffic excluded from analytics</li>
        <li><strong>CORS restrictions</strong>: Only whitelisted domains access your API</li>
      </ul>

      <h2>9. How to Exercise Your Rights</h2>

      <h3>9.1 Self-Service Options</h3>
      <p><strong>Account Settings Page:</strong></p>
      <ul>
        <li>Update name, email, profile image</li>
        <li>Delete your account (immediate, permanent)</li>
        <li>Revoke API keys</li>
        <li>Delete projects and articles</li>
      </ul>
      <p><strong>Available at:</strong> <code>simplist.blog/settings</code> (when logged in)</p>

      <h3>9.2 Email Requests</h3>
      <p><strong>Contact:</strong> <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a></p>

      <p><strong>Request types:</strong></p>
      <ul>
        <li>Data access (Art. 15)</li>
        <li>Data portability (Art. 20)</li>
        <li>Restriction of processing (Art. 18)</li>
        <li>Objection to processing (Art. 21)</li>
        <li>Withdrawal of consent (Art. 7)</li>
        <li>Complaint or concern</li>
      </ul>

      <p><strong>Required information:</strong></p>
      <ul>
        <li>Your full name</li>
        <li>Email address associated with your account</li>
        <li>Specific request details</li>
        <li>Proof of identity (if applicable)</li>
      </ul>

      <p><strong>Response time:</strong></p>
      <ul>
        <li>Standard: <strong>30 days</strong> (Art. 12(3))</li>
        <li>Extended: <strong>60 days</strong> for complex requests (with notification)</li>
      </ul>

      <p><strong>No fees:</strong> Requests are free unless manifestly unfounded or excessive (Art. 12(5)).</p>

      <h2>10. Contact Information</h2>
      <div className="bg-muted p-6 rounded-lg">
        <p className="font-semibold mb-2">Data Controller:</p>
        <p>
          Gaëtan HUSZOVITS<br />
          Email: <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a><br />
          Website: simplist.blog
        </p>

        <p className="font-semibold mt-4 mb-2">Supervisory Authority:</p>
        <p>
          Commission Nationale de l&apos;Informatique et des Libertés (CNIL)<br />
          Website: <a href="https://www.cnil.fr/en/home" target="_blank" rel="noopener noreferrer">www.cnil.fr/en/home</a>
        </p>
      </div>

      <h2>11. Updates to This Document</h2>
      <p>We may update this GDPR Compliance Document to reflect changes in our practices or legal requirements.</p>

      <p><strong>Notification:</strong></p>
      <ul>
        <li>Material changes will be communicated via email</li>
        <li>&ldquo;Last Updated&rdquo; date will be revised</li>
        <li>Continued use constitutes acceptance</li>
      </ul>

      <p><strong>Version history:</strong> Available upon request at <a href="mailto:privacy@simplist.blog">privacy@simplist.blog</a></p>

      <h2>12. Additional Resources</h2>
      <ul>
        <li><Link href="/legal/privacy">Privacy Policy</Link></li>
        <li><Link href="/legal/terms">Terms of Service</Link></li>
        <li><strong>GDPR Full Text</strong>: <a href="https://gdpr-info.eu/" target="_blank" rel="noopener noreferrer">gdpr-info.eu</a></li>
        <li><strong>European Commission - GDPR</strong>: <a href="https://ec.europa.eu/info/law/law-topic/data-protection_en" target="_blank" rel="noopener noreferrer">ec.europa.eu/info/law/law-topic/data-protection_en</a></li>
        <li><strong>CNIL (France)</strong>: <a href="https://www.cnil.fr/en/home" target="_blank" rel="noopener noreferrer">cnil.fr/en/home</a></li>
        <li><strong>Your Rights (EU)</strong>: <a href="https://ec.europa.eu/info/law/law-topic/data-protection/reform/rights-citizens_en" target="_blank" rel="noopener noreferrer">ec.europa.eu/info/law/law-topic/data-protection/reform/rights-citizens_en</a></li>
      </ul>

      <hr className="my-8" />

      <div className="text-center bg-primary/10 p-6 rounded-lg">
        <p className="font-bold text-lg mb-2">
          Simplist is committed to respecting your privacy and upholding your rights under GDPR.
        </p>
        <p>
          For questions or to exercise your rights, contact: <a href="mailto:privacy@simplist.blog" className="underline">privacy@simplist.blog</a>
        </p>
      </div>
    </article>
  );
};

export default GDPRCompliancePage;
