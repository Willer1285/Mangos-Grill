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
  ImageUpload,
} from "@/components/ui";
import { Search, Plus, Edit2, Trash2, MapPin, Eye, Phone } from "lucide-react";
import { useBrand, formatDate } from "@/lib/brand/brand-context";

type Role = "All" | "SuperAdmin" | "Manager" | "Client";
type Status = "All" | "Active" | "Disabled";

interface Location {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  idNumber?: string;
  avatar?: string;
  role: "SuperAdmin" | "Manager" | "Client";
  location?: string;
  status: "Active" | "Disabled";
  createdAt: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  avatar: string;
  password: string;
  role: "SuperAdmin" | "Manager" | "Client";
  location: string;
  status: "Active" | "Disabled";
}

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  idNumber: "",
  avatar: "",
  password: "",
  role: "Client",
  location: "",
  status: "Active",
};

export default function UsersPage() {
  const brand = useBrand();
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
  const [locations, setLocations] = useState<Location[]>([]);
  const [viewUser, setViewUser] = useState<User | null>(null);
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

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/admin/locations");
        if (res.ok) setLocations(await res.json());
      } catch {
        /* empty */
      }
    }
    fetchLocations();
  }, []);

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
      idNumber: user.idNumber || "",
      avatar: user.avatar || "",
      password: "",
      role: user.role,
      location: user.location || "",
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
      if (formData.role === "Manager" && !formData.location) {
        throw new Error("Location is required for Manager role");
      }

      const payload = {
        ...formData,
        location: formData.role === "Manager" ? formData.location : undefined,
      };

      if (editingId) {
        const { password: _, ...updateData } = payload;
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
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
              <option value="Manager">Manager</option>
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">ID Number</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brown-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {users.map((user) => (
                    <tr key={user._id} className="transition-colors hover:bg-cream-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={getInitials(user.firstName, user.lastName)} src={user.avatar} size="sm" />
                          <span className="font-medium text-brown-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-brown-700">
                        {user.idNumber || <span className="text-brown-400">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant="default">{user.role}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-brown-600">
                        {user.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-brown-400" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-brown-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant={user.status === "Active" ? "active" : "disabled"}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="icon" size="icon-sm" aria-label="View user" onClick={() => setViewUser(user)}>
                            <Eye className="h-4 w-4 text-info-500" />
                          </Button>
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
              <ImageUpload label="Profile Photo" value={formData.avatar} onChange={(url) => setFormData((p) => ({ ...p, avatar: url }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" required value={formData.firstName} onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))} />
                <Input label="Last Name" required value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))} />
              </div>
              <Input label="Email" required type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} disabled={!!editingId} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="+15551234567" />
                <Input label="ID Number" value={formData.idNumber} onChange={(e) => setFormData((p) => ({ ...p, idNumber: e.target.value }))} placeholder="V-12345678" />
              </div>
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Account Settings</p>
              {!editingId && (
                <Input label="Password" required type="password" minLength={6} value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} />
              )}
              <div className="grid grid-cols-2 gap-4">
                <Select value={formData.role} onValueChange={(v) => setFormData((p) => ({ ...p, role: v as "SuperAdmin" | "Manager" | "Client", location: v !== "Manager" ? "" : p.location }))}>
                  <SelectTrigger label="Role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
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

              {/* Location assignment for Manager */}
              {formData.role === "Manager" && (
                <Select value={formData.location} onValueChange={(v) => setFormData((p) => ({ ...p, location: v }))}>
                  <SelectTrigger label="Assigned Location *">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc._id} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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

      {/* View User Profile Modal */}
      <Modal open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>User Profile</ModalTitle>
            <ModalDescription>Complete profile information for this user.</ModalDescription>
          </ModalHeader>
          {viewUser && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar initials={getInitials(viewUser.firstName, viewUser.lastName)} src={viewUser.avatar} size="lg" />
                <div>
                  <p className="text-lg font-semibold text-brown-900">{viewUser.firstName} {viewUser.lastName}</p>
                  <Badge variant={viewUser.status === "Active" ? "active" : "disabled"}>{viewUser.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-cream-200 bg-cream-50 p-4">
                <div>
                  <p className="text-xs font-medium uppercase text-brown-400">Email</p>
                  <p className="text-sm text-brown-900">{viewUser.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-brown-400">Phone</p>
                  <p className="text-sm text-brown-900">{viewUser.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-brown-400">ID Number</p>
                  <p className="text-sm text-brown-900">{viewUser.idNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-brown-400">Role</p>
                  <p className="text-sm text-brown-900">{viewUser.role}</p>
                </div>
                {viewUser.role === "Manager" && viewUser.location && (
                  <div>
                    <p className="text-xs font-medium uppercase text-brown-400">Location</p>
                    <p className="flex items-center gap-1 text-sm text-brown-900">
                      <MapPin className="h-3.5 w-3.5 text-terracotta-500" />
                      {viewUser.location}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium uppercase text-brown-400">Registered</p>
                  <p className="text-sm text-brown-900">{formatDate(viewUser.createdAt, brand.timezone)}</p>
                </div>
              </div>
              <ModalFooter>
                <Button variant="secondary" onClick={() => setViewUser(null)}>Close</Button>
                <Button onClick={() => { setViewUser(null); openEdit(viewUser); }}>Edit User</Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
