import { EmailLayout } from "./email-layout";

type Props = {
  name: string;
  projectName: string;
};

export const ProjectDeletedEmail = ({ name, projectName }: Props) => {
  return (
    <EmailLayout previewText="Your project has been deleted">
      <h1>Project deleted</h1>

      <p>Hi {name},</p>

      <p>
        This confirms the deletion of your project <strong>{projectName}</strong>. All associated data (articles,
        analytics, tags, API keys, and members) has been permanently removed.
      </p>

      <p className="muted">
        If you didn&apos;t request this deletion, contact support immediately.
      </p>
    </EmailLayout>
  );
};