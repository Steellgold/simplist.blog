import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

const RootPage = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/home");
}

export default RootPage;
