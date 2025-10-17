import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
}

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
    </div>
  );
}

export default DashboardPage;
