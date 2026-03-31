import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarWrapper } from "./sidebar-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name || "User",
    role: (session.user as any).role || "SPECIALIST",
    image: session.user.image,
    id: (session.user as any).id,
  };

  return <SidebarWrapper user={user}>{children}</SidebarWrapper>;
}
