import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Simplist blog management platform - GDPR compliant",
};

const PrivacyPolicyPage = () => {
  return (
    <article className="prose max-w-none">
      <h1>Privacy Policy</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date:</strong> October 20, 2025<br />
        <strong>Last Updated:</strong> October 20, 2025
      </p>

      <h2>1. Introduction</h2>
      <p>
        This Privacy Policy explains how Simplist (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, stores, and protects your personal data when you use our blog management platform at simplist.blog and api.simplist.blog.
      </p>
      <p>
        Simplist is operated by <strong>Gaëtan HUSZOVITS</strong>, an independent contractor based in France.
      </p>
      <p>
        We are committed to protecting your privacy and complying with the <strong>General Data Protection Regulation (GDPR)</strong> and other applicable data protection laws.
      </p>

      <h2>2. Data Controller</h2>
      <p>The data controller responsible for your personal data is:</p>
      <p>
        <strong>Gaëtan HUSZOVITS</strong><br />
        Email: privacy@simplist.blog<br />
        Website: simplist.blog
      </p>
      <p>
        For data protection inquiries, requests to exercise your rights, or concerns about your privacy, please contact us at privacy@simplist.blog.
      </p>

      <h2>3. Legal Basis for Processing</h2>
      <p>We process your personal data under the following legal bases:</p>
      <ul>
        <li><strong>Contract Performance</strong> (GDPR Art. 6(1)(b)): To provide the Service you have signed up for</li>
        <li><strong>Legitimate Interest</strong> (GDPR Art. 6(1)(f)): To improve the Service, prevent fraud, and ensure security</li>
        <li><strong>Consent</strong> (GDPR Art. 6(1)(a)): For optional analytics tracking on published articles (via visitor consent)</li>
        <li><strong>Legal Obligation</strong> (GDPR Art. 6(1)(c)): To comply with applicable laws and regulations</li>
      </ul>

      <h2>4. Data We Collect</h2>

      <h3>4.1 Account Information</h3>
      <p>When you create an account, we collect:</p>
      <ul>
        <li><strong>Email address</strong> (required)</li>
        <li><strong>Name</strong> (optional, can be pseudonym)</li>
        <li><strong>Profile image URL</strong> (optional, if provided via OAuth)</li>
        <li><strong>Account creation and update timestamps</strong></li>
      </ul>

      <h3>4.2 Authentication Data</h3>
      <p>Depending on your chosen authentication method:</p>

      <p><strong>Email/Password Authentication:</strong></p>
      <ul>
        <li><strong>Hashed password</strong> (we do NOT store plaintext passwords)</li>
        <li><strong>Email verification status</strong></li>
      </ul>

      <p><strong>OAuth Authentication (Google, GitHub):</strong></p>
      <ul>
        <li><strong>OAuth provider ID</strong> (e.g., Google ID, GitHub ID)</li>
        <li><strong>Access tokens and refresh tokens</strong> (securely stored, used only for authentication)</li>
        <li><strong>Token expiration dates</strong></li>
        <li><strong>OAuth scope information</strong></li>
      </ul>

      <h3>4.3 Session Data</h3>
      <p>To maintain your logged-in state, we collect:</p>
      <ul>
        <li><strong>Session tokens</strong> (unique per session)</li>
        <li><strong>Session expiration timestamps</strong></li>
        <li><strong>IP address</strong> (logged per session for security purposes)</li>
        <li><strong>User agent</strong> (browser/device information)</li>
      </ul>

      <h3>4.4 Project and Content Data</h3>
      <p>When you create and manage projects:</p>
      <ul>
        <li><strong>Project name and slug</strong> (URL identifier)</li>
        <li><strong>Project description</strong></li>
        <li><strong>Allowed CORS origins</strong> (domains authorized to access your API)</li>
        <li><strong>Articles</strong>: title, slug, content (Markdown), excerpt, cover image URL</li>
        <li><strong>Article metadata</strong>: publication status, view counts, word/character/line counts, reading time estimates</li>
        <li><strong>Creation and modification timestamps</strong></li>
      </ul>

      <h3>4.5 API Keys</h3>
      <p>When you generate API keys:</p>
      <ul>
        <li><strong>Key name</strong> (user-defined label)</li>
        <li><strong>Key value</strong> (secret token)</li>
        <li><strong>Key type</strong> (secret or public)</li>
        <li><strong>Permissions</strong> (read, analytics)</li>
        <li><strong>Expiration date</strong> (if set)</li>
        <li><strong>Last used timestamp</strong></li>
        <li><strong>Creation and deletion timestamps</strong></li>
      </ul>

      <h3>4.6 File Uploads</h3>
      <p>When you upload images:</p>
      <ul>
        <li><strong>Image files</strong> (stored on Cloudflare R2)</li>
        <li><strong>File metadata</strong>: filename, size, MIME type, upload timestamp</li>
        <li><strong>Uploader reference</strong> (linked to your user account)</li>
      </ul>

      <h3>4.7 Visitor Analytics (for Published Articles)</h3>
      <p>
        When visitors access your published articles via the Public API, we collect <strong>anonymized analytics data</strong>:
      </p>

      <p><strong>Visitor Identification (Anonymized):</strong></p>
      <ul>
        <li><strong>Visitor ID</strong>: SHA256 hash of (IP address + User Agent), truncated to 16 characters</li>
        <li className="text-amber-600 dark:text-amber-400"><strong>Important</strong>: The IP address itself is NOT stored; only the hash is retained</li>
        <li><strong>Session ID</strong>: Browser session identifier (generated client-side)</li>
      </ul>

      <p><strong>Geographic Data:</strong></p>
      <ul>
        <li>Country, country code, city, region, timezone</li>
        <li><strong>Note</strong>: Derived from IP address but IP is not stored</li>
      </ul>

      <p><strong>Device and Browser Information:</strong></p>
      <ul>
        <li>User agent string</li>
        <li>Device type (mobile, desktop, tablet)</li>
        <li>Browser type and version (Chrome, Firefox, Safari, Edge)</li>
        <li>Operating system and version (Windows, macOS, Linux, Android, iOS)</li>
        <li>Screen width and height</li>
      </ul>

      <p><strong>Traffic Sources:</strong></p>
      <ul>
        <li>Referrer URL and domain</li>
        <li>UTM parameters (source, medium, campaign, term, content)</li>
      </ul>

      <p><strong>Engagement Metrics:</strong></p>
      <ul>
        <li>Page URL and title</li>
        <li>Time on page (seconds)</li>
        <li>Scroll depth (percentage)</li>
        <li>Exit position (scroll position when leaving)</li>
        <li>Bounce status (did user navigate elsewhere or leave immediately)</li>
      </ul>

      <p><strong>Event Tracking:</strong></p>
      <ul>
        <li>Event type (scroll milestones, clicks, focus/blur)</li>
        <li>Event data (additional context)</li>
        <li>Position on page (0-100%)</li>
        <li>Element identifier (CSS selector)</li>
        <li>Timestamp and time offset from page load</li>
      </ul>

      <p><strong>Bot Filtering:</strong></p>
      <ul>
        <li>Automated bot traffic is detected and excluded from analytics</li>
      </ul>

      <h3>4.8 Technical and Log Data</h3>
      <p>We may collect:</p>
      <ul>
        <li><strong>Error logs</strong> (to diagnose technical issues)</li>
        <li><strong>API request logs</strong> (for rate limiting and abuse prevention)</li>
        <li><strong>Cached data</strong> (stored temporarily in Redis for performance)</li>
      </ul>

      <h2>5. How We Use Your Data</h2>

      <h3>5.1 To Provide the Service</h3>
      <ul>
        <li>Create and manage your account</li>
        <li>Authenticate your login sessions</li>
        <li>Store and serve your blog content</li>
        <li>Generate and validate API keys</li>
        <li>Process image uploads</li>
        <li>Track analytics for your articles</li>
      </ul>

      <h3>5.2 To Improve the Service</h3>
      <ul>
        <li>Analyze usage patterns to enhance features</li>
        <li>Diagnose and fix technical issues</li>
        <li>Optimize performance and infrastructure</li>
      </ul>

      <h3>5.3 To Ensure Security</h3>
      <ul>
        <li>Detect and prevent fraud, abuse, and unauthorized access</li>
        <li>Enforce our Terms of Service</li>
        <li>Monitor for suspicious activity</li>
      </ul>

      <h3>5.4 To Communicate with You</h3>
      <ul>
        <li>Send service-related notifications (e.g., password resets, account changes)</li>
        <li>Respond to your support requests</li>
        <li>Notify you of changes to our policies or Terms of Service</li>
      </ul>

      <p className="font-medium">We do NOT send marketing emails.</p>

      <h2>6. Data Storage and Retention</h2>

      <h3>6.1 Storage Locations</h3>
      <p>Your data is stored in the following locations:</p>

      <p><strong>Primary Database (PostgreSQL):</strong></p>
      <ul>
        <li>Provider: Neon (via AWS)</li>
        <li>Location: <strong>EU Central Europe (Frankfurt, Germany)</strong></li>
      </ul>

      <p><strong>Caching Layer (Redis):</strong></p>
      <ul>
        <li>Provider: Upstash</li>
        <li>Primary region: <strong>United States</strong></li>
        <li>Read replicas: <strong>European Union</strong></li>
        <li>Cache retention: <strong>5 minutes</strong> (automatic expiration)</li>
      </ul>

      <p><strong>File Storage (Images):</strong></p>
      <ul>
        <li>Provider: Cloudflare R2</li>
        <li>Location: <strong>Western Europe (WEUR)</strong></li>
      </ul>

      <p><strong>API Infrastructure:</strong></p>
      <ul>
        <li>Location: <strong>EU West</strong></li>
      </ul>

      <h3>6.2 International Data Transfers</h3>
      <p>
        Some of our service providers (Upstash Redis) may process data in the United States. We rely on:
      </p>
      <ul>
        <li><strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
        <li><strong>Adequacy decisions</strong> where applicable</li>
        <li><strong>Service provider commitments</strong> to GDPR-equivalent protections</li>
      </ul>

      <h3>6.3 Data Retention Periods</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Data Type</th>
              <th>Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account information</td>
              <td>Until account deletion by user</td>
            </tr>
            <tr>
              <td>Authentication data</td>
              <td>Until account deletion by user</td>
            </tr>
            <tr>
              <td>Session data</td>
              <td>Until session expires or account deleted</td>
            </tr>
            <tr>
              <td>Projects and articles</td>
              <td>Until project/account deletion by user</td>
            </tr>
            <tr>
              <td>API keys</td>
              <td>Until revoked by user or account deleted (soft delete)</td>
            </tr>
            <tr>
              <td>Visitor analytics</td>
              <td>Until project/account deletion by user</td>
            </tr>
            <tr>
              <td>Uploaded images</td>
              <td>Until manually deleted or account deleted</td>
            </tr>
            <tr>
              <td>Redis cache</td>
              <td>5 minutes (automatic expiration)</td>
            </tr>
            <tr>
              <td>Audit logs</td>
              <td>90 days (for security purposes)</td>
            </tr>
            <tr>
              <td>Email verification tokens</td>
              <td>24 hours or until verified</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4">
        <strong>Upon account deletion:</strong>
      </p>
      <ul>
        <li>All personal data is permanently deleted within <strong>30 days</strong></li>
        <li>Backups containing your data may persist for up to <strong>90 days</strong> before automatic purge</li>
      </ul>

      <h2>7. Data Sharing and Third Parties</h2>

      <h3>7.1 Third-Party Services</h3>
      <p>We share data with the following service providers <strong>only as necessary</strong> to operate the Service:</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Service</th>
              <th>Purpose</th>
              <th>Data Shared</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Neon (AWS)</td>
              <td>Database hosting</td>
              <td>All user data</td>
              <td>EU (Frankfurt)</td>
            </tr>
            <tr>
              <td>Upstash</td>
              <td>Redis caching</td>
              <td>API keys, analytics data (cached)</td>
              <td>US (primary), EU (replicas)</td>
            </tr>
            <tr>
              <td>Cloudflare R2</td>
              <td>File storage</td>
              <td>Uploaded images</td>
              <td>EU (WEUR)</td>
            </tr>
            <tr>
              <td>Google OAuth</td>
              <td>Authentication</td>
              <td>Email, name, profile image</td>
              <td>Global</td>
            </tr>
            <tr>
              <td>GitHub OAuth</td>
              <td>Authentication</td>
              <td>Email, name, profile image</td>
              <td>Global</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4">
        All third-party processors are contractually obligated to comply with GDPR and protect your data.
      </p>

      <h3>7.2 No Selling of Data</h3>
      <p className="font-bold text-lg">
        We do NOT sell, rent, or trade your personal data to third parties.
      </p>

      <h3>7.3 Legal Disclosures</h3>
      <p>We may disclose your data if required by:</p>
      <ul>
        <li><strong>Legal process</strong> (court orders, subpoenas)</li>
        <li><strong>Law enforcement requests</strong> (with valid legal authority)</li>
        <li><strong>Protection of rights</strong> (to enforce our Terms, prevent fraud, or protect safety)</li>
      </ul>

      <h2>8. Your Rights Under GDPR</h2>
      <p>As a data subject in the European Economic Area (EEA), you have the following rights:</p>

      <h3>8.1 Right to Access (Art. 15)</h3>
      <p>You have the right to request a copy of all personal data we hold about you.</p>
      <p><strong>How to exercise:</strong> Email privacy@simplist.blog with subject &ldquo;Data Access Request&rdquo;</p>

      <h3>8.2 Right to Rectification (Art. 16)</h3>
      <p>You have the right to correct inaccurate or incomplete personal data.</p>
      <p><strong>How to exercise:</strong> Update your information via account settings, or email privacy@simplist.blog</p>

      <h3>8.3 Right to Erasure / &ldquo;Right to be Forgotten&rdquo; (Art. 17)</h3>
      <p>You have the right to request deletion of your personal data.</p>
      <p><strong>How to exercise:</strong> Delete your account via account settings, or email privacy@simplist.blog</p>
      <p><strong>Note:</strong> Upon account deletion, all associated data (projects, articles, API keys, analytics) will be permanently deleted.</p>

      <h3>8.4 Right to Restriction of Processing (Art. 18)</h3>
      <p>You have the right to request that we limit how we use your data.</p>
      <p><strong>How to exercise:</strong> Email privacy@simplist.blog with specific instructions</p>

      <h3>8.5 Right to Data Portability (Art. 20)</h3>
      <p>You have the right to receive your data in a structured, machine-readable format.</p>
      <p><strong>How to exercise:</strong> Email privacy@simplist.blog with subject &ldquo;Data Portability Request&rdquo;</p>

      <h3>8.6 Right to Object (Art. 21)</h3>
      <p>You have the right to object to processing based on legitimate interests.</p>
      <p><strong>How to exercise:</strong> Email privacy@simplist.blog</p>

      <h3>8.7 Right to Withdraw Consent (Art. 7(3))</h3>
      <p>Where processing is based on consent, you may withdraw consent at any time.</p>
      <p><strong>How to exercise:</strong> Update preferences in account settings or email privacy@simplist.blog</p>

      <h3>8.8 Right to Lodge a Complaint</h3>
      <p>You have the right to file a complaint with a supervisory authority:</p>
      <p>
        <strong>France (CNIL):</strong><br />
        Commission Nationale de l&apos;Informatique et des Libertés<br />
        3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France<br />
        Website: <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
      </p>

      <p>
        For detailed information about exercising your rights, see our <Link href="/legal/gdpr">GDPR Compliance Document</Link>.
      </p>

      <h2>9. Security Measures</h2>
      <p>We implement industry-standard security measures to protect your data:</p>

      <h3>9.1 Technical Safeguards</h3>
      <ul>
        <li><strong>Encryption in transit</strong>: TLS/SSL for all connections (HTTPS)</li>
        <li><strong>Encryption at rest</strong>: Database encryption via Neon/AWS</li>
        <li><strong>Password hashing</strong>: Bcrypt algorithm (passwords never stored in plaintext)</li>
        <li><strong>API key security</strong>: Keys stored securely; secret keys marked as sensitive</li>
        <li><strong>Session tokens</strong>: Cryptographically secure, unique per session</li>
        <li><strong>Rate limiting</strong>: Protection against brute-force attacks (API: 100 req/min)</li>
      </ul>

      <h3>9.2 Access Controls</h3>
      <ul>
        <li><strong>Authentication required</strong>: All admin features require valid login</li>
        <li><strong>API key permissions</strong>: Granular read/analytics permissions</li>
        <li><strong>CORS restrictions</strong>: Only whitelisted domains can access your API</li>
        <li><strong>Bot filtering</strong>: Automated traffic excluded from analytics</li>
      </ul>

      <h3>9.3 Operational Safeguards</h3>
      <ul>
        <li><strong>Regular security audits</strong> of code and infrastructure</li>
        <li><strong>Secure coding practices</strong> (input validation, SQL injection prevention)</li>
        <li><strong>Minimal data collection</strong> (privacy by design)</li>
        <li><strong>Anonymization</strong>: IP addresses hashed, not stored</li>
      </ul>

      <h3>9.4 Data Breach Notification</h3>
      <p>In the event of a data breach affecting your personal data:</p>
      <ul>
        <li>We will notify you <strong>within 72 hours</strong> of discovery via email</li>
        <li>We will report the breach to the relevant supervisory authority (CNIL) as required by GDPR Art. 33</li>
      </ul>

      <h2>10. Cookies and Tracking Technologies</h2>

      <h3>10.1 Cookies We Use</h3>
      <p>Simplist uses <strong>minimal cookies</strong> for essential functionality:</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Cookie Name</th>
              <th>Purpose</th>
              <th>Duration</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Session cookie</td>
              <td>Maintain your logged-in state</td>
              <td>Session (expires on logout)</td>
              <td>Essential</td>
            </tr>
            <tr>
              <td>Auth token</td>
              <td>Authenticate API requests</td>
              <td>Session</td>
              <td>Essential</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>10.2 No Third-Party Tracking</h3>
      <p>We do <strong>NOT</strong> use:</p>
      <ul>
        <li>Google Analytics</li>
        <li>Facebook Pixel</li>
        <li>Advertising trackers</li>
        <li>Social media tracking pixels</li>
      </ul>

      <h3>10.3 Analytics Tracking</h3>
      <p>Visitor analytics on published articles (via Public API) use:</p>
      <ul>
        <li><strong>Anonymized visitor IDs</strong> (hashed, not tied to personal identity)</li>
        <li><strong>No persistent cookies</strong> (session-based tracking only)</li>
        <li><strong>First-party tracking</strong> (no third-party analytics services)</li>
      </ul>

      <h2>11. Children&apos;s Privacy</h2>
      <p>
        Simplist is <strong>not intended for users under 16 years of age</strong>. We do not knowingly collect personal data from children under 16.
      </p>
      <p>If we become aware that a user under 16 has provided personal data, we will:</p>
      <ul>
        <li>Delete the account and associated data immediately</li>
        <li>Notify the user via email (if possible)</li>
      </ul>
      <p>
        If you believe a child under 16 has created an account, please contact privacy@simplist.blog.
      </p>

      <h2>12. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
      </p>
      <p><strong>When we make material changes:</strong></p>
      <ul>
        <li>We will notify you via email (to the address associated with your account)</li>
        <li>We will update the &ldquo;Last Updated&rdquo; date at the top of this page</li>
        <li>We will post a notice on the Service</li>
      </ul>
      <p>
        <strong>Continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.</strong>
      </p>
      <p>We encourage you to review this Privacy Policy periodically.</p>

      <h2>13. Contact Us</h2>
      <p>For questions, concerns, or requests related to this Privacy Policy or your personal data, please contact:</p>
      <p>
        <strong>Data Controller:</strong><br />
        Gaëtan HUSZOVITS<br />
        Email: privacy@simplist.blog<br />
        Website: simplist.blog
      </p>
      <p>
        <strong>Response Time:</strong><br />
        We aim to respond to all privacy inquiries within <strong>30 days</strong> (as required by GDPR Art. 12(3)).
      </p>

      <h2>14. Additional Resources</h2>
      <ul>
        <li><Link href="/legal/terms">Terms of Service</Link></li>
        <li><Link href="/legal/gdpr">GDPR Compliance & User Rights</Link></li>
        <li><strong>European Commission - Data Protection</strong>: <a href="https://ec.europa.eu/info/law/law-topic/data-protection_en" target="_blank" rel="noopener noreferrer">ec.europa.eu/info/law/law-topic/data-protection_en</a></li>
        <li><strong>CNIL (France)</strong>: <a href="https://www.cnil.fr/en/home" target="_blank" rel="noopener noreferrer">cnil.fr/en/home</a></li>
      </ul>

      <hr className="my-8" />

      <p className="text-center font-medium">
        By using Simplist, you acknowledge that you have read and understood this Privacy Policy.
      </p>
    </article>
  );
};

export default PrivacyPolicyPage;
