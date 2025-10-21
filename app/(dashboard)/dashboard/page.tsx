import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
}

const DashboardPage = () => {
  return (
    <PageHeader 
      title="Dashboard"
      description="Welcome to your blog management dashboard"
    />
  );
}

export default DashboardPage;
