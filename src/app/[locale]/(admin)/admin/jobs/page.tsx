"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button, Avatar, getInitials } from "@/components/ui";
import { Briefcase, Users, UserCheck, Clock, Plus, Eye, Edit2 } from "lucide-react";

/* ── Mock KPI data ── */
const kpis = [
  { label: "Active Jobs", value: 8, icon: Briefcase, color: "bg-terracotta-500/10 text-terracotta-500" },
  { label: "Applications", value: 156, icon: Users, color: "bg-info-500/10 text-info-500" },
  { label: "Interviews", value: 12, icon: Clock, color: "bg-warning-500/10 text-warning-500" },
  { label: "Hired this month", value: 3, icon: UserCheck, color: "bg-success-500/10 text-success-500" },
] as const;

/* ── Mock job data ── */
const jobs = [
  { id: "J-001", title: "Head Chef", department: "Kitchen", type: "full-time" as const, applications: 24, posted: "2026-02-15", status: "active" as const },
  { id: "J-002", title: "Server", department: "Front of House", type: "part-time" as const, applications: 42, posted: "2026-02-20", status: "active" as const },
  { id: "J-003", title: "Bartender", department: "Bar", type: "full-time" as const, applications: 31, posted: "2026-02-22", status: "active" as const },
  { id: "J-004", title: "Dishwasher", department: "Kitchen", type: "part-time" as const, applications: 18, posted: "2026-01-10", status: "closed" as const },
  { id: "J-005", title: "Marketing Manager", department: "Marketing", type: "full-time" as const, applications: 41, posted: "2026-02-28", status: "draft" as const },
];

/* ── Mock applications ── */
const applications = [
  { id: "A-001", firstName: "Elena", lastName: "Rodriguez", position: "Head Chef", applied: "2026-03-01", experience: "8 years", status: "interview" as const },
  { id: "A-002", firstName: "Marco", lastName: "Diaz", position: "Server", applied: "2026-03-02", experience: "2 years", status: "pending" as const },
  { id: "A-003", firstName: "Isabella", lastName: "Torres", position: "Bartender", applied: "2026-02-28", experience: "5 years", status: "hired" as const },
  { id: "A-004", firstName: "David", lastName: "Chen", position: "Server", applied: "2026-03-01", experience: "1 year", status: "rejected" as const },
  { id: "A-005", firstName: "Camila", lastName: "Vargas", position: "Marketing Manager", applied: "2026-03-02", experience: "6 years", status: "pending" as const },
];

type JobTab = "all" | "active" | "draft" | "closed";

const jobTabs: { key: JobTab; label: string }[] = [
  { key: "all", label: "All Jobs" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "closed", label: "Closed" },
];

const typeLabels: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  closed: "Closed",
};

const appStatusLabels: Record<string, string> = {
  pending: "Pending",
  interview: "Interview",
  hired: "Hired",
  rejected: "Rejected",
};

const appStatusVariants: Record<string, "pending" | "info" | "success" | "error"> = {
  pending: "pending",
  interview: "info",
  hired: "success",
  rejected: "error",
};

export default function JobsManagementPage() {
  const [activeTab, setActiveTab] = useState<JobTab>("all");

  const filteredJobs = activeTab === "all" ? jobs : jobs.filter((j) => j.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Jobs Management</h1>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Post New Job
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-brown-900">{kpi.value}</p>
                <p className="text-xs text-brown-500">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Job Tabs */}
      <div className="flex flex-wrap gap-2">
        {jobTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-terracotta-500 text-white"
                : "border border-cream-200 bg-white text-brown-600 hover:bg-cream-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Department</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Type</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Applications</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Posted</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                    <td className="px-5 py-3 font-medium text-brown-900">{job.title}</td>
                    <td className="px-5 py-3 text-brown-700">{job.department}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant="primary">{typeLabels[job.type]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-brown-700">{job.applications}</td>
                    <td className="px-5 py-3 text-brown-600">{job.posted}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={job.status}>{statusLabels[job.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Eye className="h-4 w-4" />
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

      {/* Recent Applications */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-cream-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-brown-900">Recent Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Applicant</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Position</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Applied</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Experience</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={getInitials(app.firstName, app.lastName)}
                          size="sm"
                        />
                        <span className="font-medium text-brown-900">
                          {app.firstName} {app.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brown-700">{app.position}</td>
                    <td className="px-5 py-3 text-brown-600">{app.applied}</td>
                    <td className="px-5 py-3 text-brown-600">{app.experience}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={appStatusVariants[app.status]}>
                        {appStatusLabels[app.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Edit2 className="h-4 w-4" />
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
    </div>
  );
}
