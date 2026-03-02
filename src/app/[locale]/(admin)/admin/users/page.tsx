"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  Avatar,
  getInitials,
  Pagination,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

type Role = "All" | "SuperAdmin" | "Staff" | "Client";
type Status = "All" | "Active" | "Disabled";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "SuperAdmin" | "Staff" | "Client";
  status: "Active" | "Disabled";
  createdAt: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "SuperAdmin" | "Staff" | "Client";
  status: "Active" | "Disabled";
}

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  role: "Client",
  status: "Active",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role>("All");
  const [statusFilter, setStatusFilter] = useState<Status>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (roleFilter !== "All") params.set("role", roleFilter);
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, searchQuery, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingId(user._id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
      status: user.status,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        // Edit user
        const { password: _, ...updateData } = formData;
        const res = await fetch(`/api/admin/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update user");
        }
      } else {
        // Create user
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create user");
        }
      }
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      fetchUsers();
    } catch {
      alert("Failed to delete user");
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">User Management</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 border border-cream-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role)}
              className="h-10 rounded-md border border-cream-300 bg-white px-3 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            >
              <option value="All">All Roles</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Staff">Staff</option>
              <option value="Client">Client</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status)}
              className="h-10 rounded-md border border-cream-300 bg-white px-3 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-cream-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center text-brown-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-200 bg-cream-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brown-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {users.map((user) => (
                    <tr key={user._id} className="transition-colors hover:bg-cream-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={getInitials(user.firstName, user.lastName)} size="sm" />
                          <span className="font-medium text-brown-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-brown-700">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant="default">{user.role}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant={user.status === "Active" ? "active" : "disabled"}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="icon" size="icon-sm" aria-label="Edit user" onClick={() => openEdit(user)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="icon" size="icon-sm" aria-label="Delete user" onClick={() => handleDelete(user._id)}>
                            <Trash2 className="h-4 w-4 text-error-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Create/Edit User Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingId ? "Edit User" : "Add New User"}</ModalTitle>
            <ModalDescription>
              {editingId ? "Update user account details and permissions." : "Create a new user account with role and access settings."}
            </ModalDescription>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Personal Information</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" required value={formData.firstName} onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))} />
                <Input label="Last Name" required value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))} />
              </div>
              <Input label="Email" required type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} disabled={!!editingId} />
              <Input label="Phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="Optional" />
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Account Settings</p>
              {!editingId && (
                <Input label="Password" required type="password" minLength={6} value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} />
              )}
              <div className="grid grid-cols-2 gap-4">
                <Select value={formData.role} onValueChange={(v) => setFormData((p) => ({ ...p, role: v as "SuperAdmin" | "Staff" | "Client" }))}>
                  <SelectTrigger label="Role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                  </SelectContent>
                </Select>
                {editingId && (
                  <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v as "Active" | "Disabled" }))}>
                    <SelectTrigger label="Status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>
                {editingId ? "Save Changes" : "Create User"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
