import { EmailLayout } from "./email-layout";

type Props = {
  name: string;
  scheduledAt: Date;
  manageUrl: string;
  reason?: string;
};

export const AccountDeletionRequestedEmail = ({ name, scheduledAt, manageUrl, reason }: Props) => {
  return (
    <EmailLayout previewText="Your account deletion has been scheduled">
      <h1>Account deletion scheduled</h1>

      <p>Hi {name},</p>

      <p>
        We received a request to delete your Simplist account. A 14-day grace period has started. If you change your
        mind, you can cancel before the deadline.
      </p>

      <div className="info-box">
        <p>
          <strong>Scheduled deletion date:</strong>{" "}
          {scheduledAt.toUTCString()}
        </p>
        <p>
          <strong>What gets deleted:</strong> projects, articles, API keys, analytics data, uploads, and sessions. Billing
          records may be retained as required by law.
        </p>
      </div>

      {reason && (
        <div className="highlight">
          <p>
            <strong>Your note:</strong> {reason}
          </p>
        </div>
      )}

      <p style={{ textAlign: "center", margin: "32px 0" }}>
        <a href={manageUrl} className="button">
          Review or cancel deletion
        </a>
      </p>

      <p className="muted">
        You will receive reminders on day 7, day 10, and 1 hour before deletion. If you take no action, your account
        will be permanently deleted on the date above.
      </p>
    </EmailLayout>
  );
};