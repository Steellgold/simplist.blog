import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const AuthCheck = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/home");
};

const RootPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCheck />
    </Suspense>
  );
};

export default RootPage;
