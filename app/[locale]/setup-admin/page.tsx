import { getServerUser } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";
import SetupAdminClient from "./SetupAdminClient";

export default async function SetupAdminPage() {
  // Server-side auth check - only ADMINs can access
  const user = await getServerUser();
  
  if (!user) {
    redirect("/auth/signin");
  }
  
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <SetupAdminClient />;
}
