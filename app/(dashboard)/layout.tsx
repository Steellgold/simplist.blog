import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // This layout handles general dashboard routes
  // Project-specific routes are handled by their own layouts
  return <>{children}</>;
};

export default DashboardLayout;