import React from "react";
import { EmailLayout } from "./email-layout";

interface WelcomeEmailProps {
  name: string;
  projectName?: string;
}

export const WelcomeEmail = ({ name, projectName }: WelcomeEmailProps) => {
  return (
    <EmailLayout previewText="Welcome to Simplist - Let's get started!">
      <h1>Welcome to Simplist</h1>

      <p>Hi {name},</p>

      <p>
        Your email has been verified and your account is now active. You're all set to start
        building your blog with Simplist.
      </p>

      {projectName && (
        <div className="highlight">
          <p>
            <strong>Your project "{projectName}"</strong> has been created successfully.
            You can now start writing articles, managing API keys, and tracking analytics.
          </p>
        </div>
      )}

      <h2>What's Next?</h2>

      <div className="feature-list">
        <div className="feature-item">
          <p>
            <strong>Write Your First Article</strong><br />
            Create engaging content with our intuitive Markdown editor.
          </p>
        </div>

        <div className="feature-item">
          <p>
            <strong>Generate API Keys</strong><br />
            Connect your blog to your website or application using our powerful API.
          </p>
        </div>

        <div className="feature-item">
          <p>
            <strong>Track Analytics</strong><br />
            Monitor your content performance with real-time analytics.
          </p>
        </div>

        <div className="feature-item">
          <p>
            <strong>Explore Pro Features</strong><br />
            Unlock unlimited articles, scheduled publishing, and more with Simplist Pro.
          </p>
        </div>
      </div>

      <p style={{ textAlign: "center", margin: "32px 0" }}>
        <a href="https://simplist.blog/" className="button">
          Go to Dashboard
        </a>
      </p>

      <hr className="divider" />

      <h2>Need Help?</h2>

      <p>
        Check out our <a href="https://simplist.blog/docs">documentation</a> or
        explore our <a href="https://simplist.blog/pricing">pricing plans</a> to
        see what Simplist can do for you.
      </p>

      <p className="muted" style={{ marginTop: "24px" }}>
        We're excited to see what you'll build.
      </p>
    </EmailLayout>
  );
};
