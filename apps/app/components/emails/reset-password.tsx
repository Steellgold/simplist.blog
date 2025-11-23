import { EmailLayout } from "./email-layout";

interface ResetPasswordProps {
  name: string;
  resetUrl: string;
}

export const ResetPassword = ({ name, resetUrl }: ResetPasswordProps) => {
  return (
    <EmailLayout previewText="Reset your Simplist password">
      <h1>Reset Your Password</h1>

      <p>Hi {name},</p>

      <p>
        We received a request to reset the password for your Simplist account. If you made this request,
        click the button below to create a new password.
      </p>

      <div className="info-box">
        <p>
          <strong>Security reminder:</strong> This link will expire in 1 hour for your security.
          If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>

      <p style={{ textAlign: "center", margin: "32px 0" }}>
        <a href={resetUrl} className="button">
          Reset Password
        </a>
      </p>

      <p className="muted">
        Or copy and paste this link into your browser:
      </p>

      <p style={{ wordBreak: "break-all", fontSize: "13px", color: "#737373" }}>
        {resetUrl}
      </p>

      <hr className="divider" />

      <h2>Need Help?</h2>

      <p>
        If you're having trouble accessing your account or didn't request this password reset,
        please contact our support team. We're here to help.
      </p>

      <p className="muted" style={{ marginTop: "24px" }}>
        For security reasons, never share your password with anyone, including Simplist staff.
      </p>
    </EmailLayout>
  );
};
