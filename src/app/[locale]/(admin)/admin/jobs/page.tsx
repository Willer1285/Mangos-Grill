"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Textarea,
  Spinner,
  Avatar,
  getInitials,
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
import { Briefcase, Users, UserCheck, Clock, Plus, Eye, Edit2 } from "lucide-react";

interface JobApplication {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  status: "Pending" | "Interview" | "Review" | "Accepted" | "Rejected";
  appliedAt: string;
}

interface Job {
  _id: string;
  title: string;
  department: string;
  employmentType: string;
  location: string;
  status: "Active" | "Draft" | "Closed";
  applications: JobApplication[];
  postedAt?: string;
  createdAt: string;
}

type JobTab = "All" | "Active" | "Draft" | "Closed";

const jobTabs: { key: JobTab; label: string }[] = [
  { key: "All", label: "All Jobs" },
  { key: "Active", label: "Active" },
  { key: "Draft", label: "Draft" },
  { key: "Closed", label: "Closed" },
];

const badgeVariant: Record<string, string> = {
  Active: "active",
  Draft: "pending",
  Closed: "disabled",
};

const appStatusVariant: Record<string, string> = {
  Pending: "pending",
  Interview: "info",
  Review: "warning",
  Accepted: "success",
  Rejected: "error",
};

const EMPTY_FORM = {
  title: "",
  department: "Kitchen",
  employmentType: "Full-time",
  location: "Miami",
  descEn: "",
  descEs: "",
  reqEn: "",
  reqEs: "",
  salaryMin: "",
  salaryMax: "",
  status: "Draft",
};

export default function JobsManagementPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<JobTab>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "All") params.set("status", activeTab);

      const res = await fetch(`/api/admin/jobs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          employmentType: formData.employmentType,
          location: formData.location,
          description: { en: formData.descEn, es: formData.descEs },
          requirements: { en: formData.reqEn, es: formData.reqEs },
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
          status: formData.status,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  // Compute KPIs from real data
  const activeCount = jobs.filter((j) => j.status === "Active").length;
  const totalApps = jobs.reduce((sum, j) => sum + j.applications.length, 0);
  const interviews = jobs.reduce((sum, j) => sum + j.applications.filter((a) => a.status === "Interview").length, 0);
  const accepted = jobs.reduce((sum, j) => sum + j.applications.filter((a) => a.status === "Accepted").length, 0);

  // All applications flattened
  const recentApps = jobs
    .flatMap((j) => j.applications.map((a) => ({ ...a, jobTitle: j.title })))
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Jobs Management</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Post New Job
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Jobs", value: activeCount, icon: Briefcase, color: "bg-terracotta-500/10 text-terracotta-500" },
          { label: "Applications", value: totalApps, icon: Users, color: "bg-info-500/10 text-info-500" },
          { label: "Interviews", value: interviews, icon: Clock, color: "bg-warning-500/10 text-warning-500" },
          { label: "Accepted", value: accepted, icon: UserCheck, color: "bg-success-500/10 text-success-500" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-20 text-center text-brown-500">No jobs found. Post your first one.</div>
          ) : (
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
                  {jobs.map((job) => (
                    <tr key={job._id} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                      <td className="px-5 py-3 font-medium text-brown-900">{job.title}</td>
                      <td className="px-5 py-3 text-brown-700">{job.department}</td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant="primary">{job.employmentType}</Badge>
                      </td>
                      <td className="px-5 py-3 text-center font-medium text-brown-700">{job.applications.length}</td>
                      <td className="px-5 py-3 text-brown-600">
                        {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant={badgeVariant[job.status] as "active" | "pending" | "disabled"}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
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

      {/* Recent Applications */}
      {recentApps.length > 0 && (
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
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app, idx) => {
                    const names = app.name.split(" ");
                    const first = names[0] || "";
                    const last = names.slice(1).join(" ") || "";
                    return (
                      <tr key={idx} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar initials={getInitials(first, last)} size="sm" />
                            <span className="font-medium text-brown-900">{app.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-brown-700">{app.jobTitle}</td>
                        <td className="px-5 py-3 text-brown-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-brown-600">{app.experience || "—"}</td>
                        <td className="px-5 py-3 text-center">
                          <Badge variant={appStatusVariant[app.status] as "pending" | "info" | "success" | "error"}>
                            {app.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Job Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Post New Job</ModalTitle>
            <ModalDescription>Create a new job listing with bilingual descriptions.</ModalDescription>
          </ModalHeader>
          <form onSubmit={handleCreate} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Job Details</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Title" required value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Head Chef" />
                <Select value={formData.department} onValueChange={(v) => setFormData((p) => ({ ...p, department: v }))}>
                  <SelectTrigger label="Department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kitchen">Kitchen</SelectItem>
                    <SelectItem value="Front of House">Front of House</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select value={formData.employmentType} onValueChange={(v) => setFormData((p) => ({ ...p, employmentType: v }))}>
                  <SelectTrigger label="Employment Type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
                <Input label="Location" required value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
              </div>
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Description</p>
              <Textarea label="English" required rows={3} value={formData.descEn} onChange={(e) => setFormData((p) => ({ ...p, descEn: e.target.value }))} />
              <Textarea label="Spanish" required rows={3} value={formData.descEs} onChange={(e) => setFormData((p) => ({ ...p, descEs: e.target.value }))} />
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Requirements</p>
              <Textarea label="English" required rows={2} value={formData.reqEn} onChange={(e) => setFormData((p) => ({ ...p, reqEn: e.target.value }))} />
              <Textarea label="Spanish" required rows={2} value={formData.reqEs} onChange={(e) => setFormData((p) => ({ ...p, reqEs: e.target.value }))} />
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Compensation & Status</p>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Min Salary ($)" type="number" min="0" value={formData.salaryMin} onChange={(e) => setFormData((p) => ({ ...p, salaryMin: e.target.value }))} />
                <Input label="Max Salary ($)" type="number" min="0" value={formData.salaryMax} onChange={(e) => setFormData((p) => ({ ...p, salaryMax: e.target.value }))} />
                <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
                  <SelectTrigger label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Post Job</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
