import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false }
}

const SettingsPage = () => {
  return (
    <PageHeader 
      title="Settings"
      description="Manage your account and project settings"
    />
  );
}

export default SettingsPage;
