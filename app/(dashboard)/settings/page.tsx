import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false }
}

const SettingsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
    </div>
  );
}

export default SettingsPage;
