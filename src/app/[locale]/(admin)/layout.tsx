import { AdminSidebar } from "@/components/layout";

const mockAdmin = {
  firstName: "Maria",
  lastName: "Gonzalez",
  role: "Administrador",
  avatar: null,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <AdminSidebar user={mockAdmin} />
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
