import { getCurrentUser } from "@/lib/auth-helper";
import { Trolley } from "@gravity-ui/icons";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { redirect } from "next/navigation";

const AdminPage = async () => {
  const user = await getCurrentUser();

  // Not logged in: Redirect to login
  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  // Not admin: Redirect to home
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trolley className="size-12" />
          </EmptyMedia>
          <EmptyTitle>Admin Panel</EmptyTitle>
          <EmptyDescription>
            This page is under development. User management, moderation tools,
            and platform analytics will be available here soon.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default AdminPage;
