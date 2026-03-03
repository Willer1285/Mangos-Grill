import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "SuperAdmin" && userRole !== "Manager") {
    redirect("/");
  }

  const user = {
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    role: session.user.role,
    location: session.user.location,
    avatar: session.user.image || null,
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminSidebar user={user} />
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
