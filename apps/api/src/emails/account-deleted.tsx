import { EmailLayout } from "./email-layout"

type Props = {
  name: string
}

export const AccountDeletedEmail = ({ name }: Props) => {
  return (
    <EmailLayout previewText="Your Simplist account has been deleted">
      <h1>Your account has been deleted</h1>

      <p>Hi {name},</p>

      <p>
        This email confirms that your Simplist account and all associated data (projects, articles, analytics, API keys,
        uploads, and sessions) have been permanently deleted.
      </p>

      <p>
        Thank you for trying Simplist. If you would like to return, you can create a new account at any time.
      </p>

      <p className="muted">
        Note: Billing records may be retained where required by law. If you did not authorize this deletion, please
        contact support immediately.
      </p>
    </EmailLayout>
  )
}

