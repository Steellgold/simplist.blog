import { EmailLayout } from "./email-layout";

type ReminderStage = "day7" | "day10" | "hour1";

type Props = {
  name: string;
  scheduledAt: Date;
  manageUrl: string;
  stage: ReminderStage;
};

const getCopy = (stage: ReminderStage) => {
  switch (stage) {
    case "day7":
      return {
        title: "7 days left to cancel deletion",
        preview:
          "Your account deletion is scheduled. Cancel if you changed your mind.",
      };
    case "day10":
      return {
        title: "4 days left to cancel deletion",
        preview: "Final days before your account is deleted.",
      };
    case "hour1":
      return {
        title: "Account deletion in 1 hour",
        preview: "Last chance to cancel before your account is removed.",
      };
  }
};

export const AccountDeletionReminderEmail = ({
  name,
  scheduledAt,
  manageUrl,
  stage,
}: Props) => {
  const copy = getCopy(stage);

  return (
    <EmailLayout previewText={copy.preview}>
      <h1>{copy.title}</h1>

      <p>Hi {name},</p>

      <p>
        Your Simplist account is scheduled for deletion. If you want to keep
        your data, cancel the deletion before the deadline.
      </p>

      <div className="info-box">
        <p>
          <strong>Deletion date:</strong> {scheduledAt.toUTCString()}
        </p>
        <p>
          <strong>What to do:</strong> Sign in and cancel the request.
          Otherwise, all projects, articles, analytics, and API keys will be
          removed permanently.
        </p>
      </div>

      <p style={{ textAlign: "center", margin: "32px 0" }}>
        <a href={manageUrl} className="button">
          Cancel deletion
        </a>
      </p>

      <p className="muted">
        If you do nothing, your account will be deleted at the date shown above.
        Billing records may be retained where required by law.
      </p>
    </EmailLayout>
  );
};
