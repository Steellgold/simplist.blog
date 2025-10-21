import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Simplist blog management platform",
};

const TermsOfServicePage = () => {
  return (
    <article className="prose max-w-none">
      <h1>Terms of Service</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date:</strong> October 20, 2025<br />
        <strong>Last Updated:</strong> October 20, 2025
      </p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to Simplist (&ldquo;Service&rdquo;, &ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Simplist, a blog management platform accessible at simplist.blog and api.simplist.blog.
      </p>
      <p>
        Simplist is operated by Gaëtan HUSZOVITS, an independent contractor (&ldquo;Operator&rdquo;).
      </p>
      <p>
        By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Service.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least <strong>16 years of age</strong> to use this Service. By using the Service, you represent and warrant that you meet this age requirement.
      </p>
      <p>
        If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
      </p>

      <h2>3. Account Registration</h2>

      <h3>3.1 Account Creation</h3>
      <p>To use the Service, you must create an account by providing:</p>
      <ul>
        <li>A valid email address</li>
        <li>A password (for email/password authentication), or</li>
        <li>Authentication via a supported OAuth provider (Google, GitHub)</li>
      </ul>

      <h3>3.2 Account Security</h3>
      <p>You are responsible for:</p>
      <ul>
        <li>Maintaining the confidentiality of your account credentials</li>
        <li>All activities that occur under your account</li>
        <li>Notifying us immediately of any unauthorized use of your account</li>
      </ul>

      <h3>3.3 Accurate Information</h3>
      <p>
        You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate and complete.
      </p>

      <h2>4. Service Description</h2>

      <h3>4.1 Core Features</h3>
      <p>Simplist provides:</p>
      <ul>
        <li><strong>One project per user</strong>: Each user may create and manage one blog project</li>
        <li><strong>Article management</strong>: Create, edit, publish, and delete articles in Markdown format</li>
        <li><strong>API access</strong>: Generate API keys to access your content programmatically</li>
        <li><strong>Analytics</strong>: Track article views, visitor engagement, and traffic sources</li>
        <li><strong>Image uploads</strong>: Upload and manage cover images for articles (max 5MB, formats: JPEG, PNG, WebP, GIF)</li>
      </ul>

      <h3>4.2 Public API</h3>
      <p>
        The Simplist Public API (<code>api.simplist.blog</code>) allows third-party access to published content via API keys. API usage is subject to:
      </p>
      <ul>
        <li><strong>Rate limiting</strong>: 100 requests per minute per API key</li>
        <li><strong>CORS restrictions</strong>: Only domains configured in your project settings may access the API</li>
        <li><strong>API key permissions</strong>: Keys may have <code>read</code> and/or <code>analytics</code> permissions</li>
      </ul>

      <h3>4.3 TypeScript SDK</h3>
      <p>
        The Simplist SDK (<code>@simplist.blog/sdk</code> on NPM) provides a type-safe client for interacting with the Public API.
      </p>

      <h2>5. User Responsibilities</h2>

      <h3>5.1 Acceptable Use</h3>
      <p>You agree NOT to:</p>
      <ul>
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe on intellectual property rights of others</li>
        <li>Upload malicious code, viruses, or harmful content</li>
        <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts</li>
        <li>Use the Service to distribute spam, phishing, or fraudulent content</li>
        <li>Scrape, data-mine, or excessively burden the Service infrastructure</li>
        <li>Reverse engineer or attempt to extract source code from the Service</li>
        <li>Use the Service to host illegal, defamatory, or obscene content</li>
        <li>Impersonate any person or entity</li>
      </ul>

      <h3>5.2 Content Ownership</h3>
      <p>
        You retain all intellectual property rights to content you create on the Platform (articles, images, etc.). By publishing content via the Public API, you grant Simplist a worldwide, non-exclusive, royalty-free license to host, store, and distribute your content as necessary to provide the Service.
      </p>

      <h3>5.3 Content Responsibility</h3>
      <p>
        You are solely responsible for the content you publish. Simplist is not responsible for user-generated content and does not pre-screen content before publication.
      </p>

      <h2>6. API Keys and Security</h2>

      <h3>6.1 API Key Types</h3>
      <ul>
        <li><strong>Secret keys</strong> (<code>sk_</code>): Full access keys that should never be exposed publicly</li>
        <li><strong>Public keys</strong> (<code>pk_</code>): Limited-access keys safe for client-side use</li>
      </ul>

      <h3>6.2 API Key Security</h3>
      <p>You are responsible for:</p>
      <ul>
        <li>Keeping secret API keys confidential</li>
        <li>Rotating keys if compromised</li>
        <li>Setting appropriate permissions and expiration dates</li>
        <li>Configuring CORS origins correctly</li>
      </ul>

      <h3>6.3 API Key Revocation</h3>
      <p>We reserve the right to revoke API keys that:</p>
      <ul>
        <li>Are used to violate these Terms</li>
        <li>Generate excessive or abusive traffic</li>
        <li>Are associated with suspended accounts</li>
      </ul>

      <h2>7. Analytics and Tracking</h2>

      <h3>7.1 Visitor Analytics</h3>
      <p>
        Simplist collects anonymized analytics data about visitors to your published articles, including:
      </p>
      <ul>
        <li>Device type, browser, and operating system</li>
        <li>Geographic location (country, city, region)</li>
        <li>Referrer sources and UTM parameters</li>
        <li>Engagement metrics (time on page, scroll depth)</li>
        <li><strong>IP addresses are NOT stored</strong> (only hashed for visitor identification)</li>
      </ul>

      <h3>7.2 Analytics Retention</h3>
      <p>Analytics data (page views, events) is retained until:</p>
      <ul>
        <li>You delete your project, or</li>
        <li>You delete your account</li>
      </ul>
      <p>
        For more information, see our <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2>8. Service Availability</h2>

      <h3>8.1 No Uptime Guarantee</h3>
      <p>
        The Service is provided &ldquo;as is&rdquo; without any guaranteed uptime or availability. We strive for high availability but do not guarantee uninterrupted access.
      </p>

      <h3>8.2 Maintenance</h3>
      <p>
        We may perform scheduled or emergency maintenance that temporarily limits access to the Service. We will provide notice when feasible.
      </p>

      <h3>8.3 Service Modifications</h3>
      <p>We reserve the right to:</p>
      <ul>
        <li>Modify, suspend, or discontinue any feature of the Service at any time</li>
        <li>Change rate limits, storage limits, or other usage restrictions</li>
        <li>Update these Terms with notice (see Section 13)</li>
      </ul>

      <h2>9. Pricing and Payment</h2>

      <h3>9.1 Free Service</h3>
      <p>
        Simplist is currently provided <strong>free of charge</strong> to all users.
      </p>

      <h3>9.2 Future Pricing</h3>
      <p>
        We reserve the right to introduce subscription plans or paid features in the future. Existing users will be notified at least 30 days before any paid features affect their usage.
      </p>

      <h2>10. Termination</h2>

      <h3>10.1 Termination by You</h3>
      <p>You may terminate your account at any time via the account settings page. Upon termination:</p>
      <ul>
        <li>Your account and all associated data (projects, articles, API keys, analytics) will be permanently deleted</li>
        <li>This action is irreversible</li>
      </ul>

      <h3>10.2 Termination by Us</h3>
      <p>We may suspend or terminate your account if:</p>
      <ul>
        <li>You violate these Terms</li>
        <li>Your account is inactive for an extended period</li>
        <li>Your usage threatens the stability or security of the Service</li>
        <li>We are required to do so by law</li>
      </ul>

      <h3>10.3 Effect of Termination</h3>
      <p>Upon termination:</p>
      <ul>
        <li>Your access to the Service will cease immediately</li>
        <li>All API keys will be revoked</li>
        <li>Content may be removed from the Public API within 24 hours</li>
        <li>We are not liable for any loss of data or content</li>
      </ul>

      <h2>11. Disclaimers</h2>

      <h3>11.1 No Warranties</h3>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
      </p>
      <ul>
        <li>Warranties of merchantability or fitness for a particular purpose</li>
        <li>Warranties of non-infringement</li>
        <li>Warranties that the Service will be error-free, secure, or uninterrupted</li>
      </ul>

      <h3>11.2 Third-Party Services</h3>
      <p>
        The Service relies on third-party providers (AWS, Cloudflare, Upstash, Google, GitHub). We are not responsible for outages, data loss, or security issues caused by these providers.
      </p>

      <h3>11.3 Data Loss</h3>
      <p>
        While we implement reasonable backup practices, we are not liable for data loss. You are responsible for maintaining your own backups of critical content.
      </p>

      <h2>12. Limitation of Liability</h2>
      <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
      <ul>
        <li>Gaëtan HUSZOVITS and Simplist SHALL NOT BE LIABLE for any indirect, incidental, special, consequential, or punitive damages</li>
        <li>Our total liability for any claim related to the Service shall not exceed €100 (one hundred euros)</li>
        <li>We are not liable for loss of profits, data, goodwill, or other intangible losses</li>
      </ul>

      <h2>13. Changes to Terms</h2>
      <p>We may update these Terms from time to time. If we make material changes:</p>
      <ul>
        <li>We will notify you via email (to the address associated with your account)</li>
        <li>The updated Terms will be posted on the Service with a new &ldquo;Last Updated&rdquo; date</li>
        <li>Continued use of the Service after changes constitutes acceptance of the new Terms</li>
      </ul>

      <h2>14. Governing Law</h2>
      <p>
        These Terms are governed by the laws of <strong>France</strong>, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of France.
      </p>

      <h2>15. GDPR and Data Protection</h2>
      <p>
        As a service operating in the European Union, we comply with the General Data Protection Regulation (GDPR). Your data protection rights are detailed in our <Link href="/legal/privacy">Privacy Policy</Link> and <Link href="/legal/gdpr">GDPR Compliance Document</Link>.
      </p>

      <h2>16. Contact Information</h2>
      <p>For questions about these Terms, please contact:</p>
      <p>
        <strong>Gaëtan HUSZOVITS</strong><br />
        Email: privacy@simplist.blog<br />
        Website: simplist.blog
      </p>

      <h2>17. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy and GDPR Compliance Document, constitute the entire agreement between you and Simplist regarding the use of the Service.
      </p>

      <h2>18. Severability</h2>
      <p>
        If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
      </p>

      <h2>19. No Waiver</h2>
      <p>
        Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
      </p>

      <hr className="my-8" />

      <p className="text-center font-medium">
        By using Simplist, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
      </p>
    </article>
  );
};

export default TermsOfServicePage;
