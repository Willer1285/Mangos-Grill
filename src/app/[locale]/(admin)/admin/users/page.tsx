"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  Avatar,
  getInitials,
  Pagination,
} from "@/components/ui";
import { Search, Plus, Edit2, Trash2, UserPlus } from "lucide-react";

type Role = "All" | "SuperAdmin" | "Staff" | "Client";
type Status = "All" | "Active" | "Disabled";

interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "SuperAdmin" | "Staff" | "Client";
  status: "active" | "disabled";
  lastLogin: string;
}

const mockUsers: MockUser[] = [
  {
    id: 1,
    firstName: "Carlos",
    lastName: "Martinez",
    email: "carlos@mangosgrill.com",
    role: "SuperAdmin",
    status: "active",
    lastLogin: "2026-03-01",
  },
  {
    id: 2,
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria@mangosgrill.com",
    role: "Staff",
    status: "active",
    lastLogin: "2026-02-28",
  },
  {
    id: 3,
    firstName: "Juan",
    lastName: "Perez",
    email: "juan@mangosgrill.com",
    role: "Staff",
    status: "active",
    lastLogin: "2026-02-27",
  },
  {
    id: 4,
    firstName: "Ana",
    lastName: "Garcia",
    email: "ana.garcia@email.com",
    role: "Client",
    status: "active",
    lastLogin: "2026-02-25",
  },
  {
    id: 5,
    firstName: "Luis",
    lastName: "Fernandez",
    email: "luis.fernandez@email.com",
    role: "Client",
    status: "disabled",
    lastLogin: "2026-01-15",
  },
  {
    id: 6,
    firstName: "Sofia",
    lastName: "Lopez",
    email: "sofia.lopez@email.com",
    role: "Client",
    status: "disabled",
    lastLogin: "2026-01-10",
  },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role>("All");
  const [statusFilter, setStatusFilter] = useState<Status>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" ||
      user.status === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / 5));

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">User Management</h1>
        <Button>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brown-900">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brown-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-cream-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={getInitials(user.firstName, user.lastName)}
                          size="sm"
                        />
                        <span className="font-medium text-brown-900">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-brown-700">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant="default">{user.role}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant={user.status === "active" ? "active" : "disabled"}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-brown-700">
                      {user.lastLogin}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="icon" size="icon-sm" aria-label="Edit user">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="icon" size="icon-sm" aria-label="Delete user">
                          <Trash2 className="h-4 w-4 text-error-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
