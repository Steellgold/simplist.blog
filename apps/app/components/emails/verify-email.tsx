import { EmailLayout } from "./email-layout";

interface VerifyEmailProps {
  name: string;
  verificationUrl: string;
}

export const VerifyEmail = ({ name, verificationUrl }: VerifyEmailProps) => {
  return (
    <EmailLayout previewText="Verify your email address to get started with Simplist">
      <h1>Welcome to Simplist</h1>

      <p>Hi {name},</p>

      <p>
        Thanks for signing up. We're excited to have you on board. Before you
        can start creating your blog, we need to verify your email address.
      </p>

      <div className="info-box">
        <p>
          <strong>Why verify?</strong> This helps us keep your account secure
          and ensures you can recover access if you ever need to reset your
          password.
        </p>
      </div>

      <p style={{ textAlign: "center", margin: "32px 0" }}>
        <a href={verificationUrl} className="button">
          Verify Email Address
        </a>
      </p>

      <p className="muted">Or copy and paste this link into your browser:</p>

      <p style={{ wordBreak: "break-all", fontSize: "13px", color: "#737373" }}>
        {verificationUrl}
      </p>

      <hr className="divider" />

      <p className="muted">
        If you didn't create an account with Simplist, you can safely ignore
        this email.
      </p>
    </EmailLayout>
  );
};
