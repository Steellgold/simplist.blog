import { EmailLayout } from "./email-layout";

interface ProjectInvitationProps {
  email: string;
  projectName: string;
  inviterName: string;
  roleName: string;
  invitationUrl: string;
}

export const ProjectInvitation = ({
  projectName,
  inviterName,
  roleName,
  invitationUrl,
}: ProjectInvitationProps) => {
  return (
    <EmailLayout
      previewText={`${inviterName} invited you to join "${projectName}" on Simplist`}
    >
      <h1>Project Invitation</h1>

      <p>Hello,</p>

      <p>
        <strong>{inviterName}</strong> has invited you to join the project{" "}
        <strong>"{projectName}"</strong> on Simplist as a{" "}
        <strong>{roleName}</strong>.
      </p>

      <p>
        By accepting this invitation, you'll be able to collaborate on this
        project and access features according to your role.
      </p>

      <p style={{ textAlign: "center", margin: "32px 0" }}>
        <a href={invitationUrl} className="button">
          Accept Invitation
        </a>
      </p>

      <div className="info-box">
        <p>
          <strong>Note:</strong> This invitation expires in 7 days. If you can't
          click the button, copy and paste this link into your browser:
        </p>
        <p
          style={{ fontSize: "14px", color: "#0066cc", wordBreak: "break-all" }}
        >
          {invitationUrl}
        </p>
      </div>

      <p style={{ fontSize: "14px", color: "#666", marginTop: "32px" }}>
        You received this email because {inviterName} invited you to join their
        project on Simplist.
        <br />
        If you're not interested, you can ignore this email.
      </p>
    </EmailLayout>
  );
};
