import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/auth/login");
}
