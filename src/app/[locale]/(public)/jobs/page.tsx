"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Heart,
  UtensilsCrossed,
  TrendingUp,
  MapPin,
  Briefcase,
  Loader2,
  DollarSign,
  X,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Input, Textarea } from "@/components/ui";
import { toast } from "sonner";

interface JobData {
  _id: string;
  title: string;
  department: string;
  employmentType: string;
  location: string;
  description: { en: string; es: string };
  requirements: { en: string; es: string };
  salaryMin?: number;
  salaryMax?: number;
  postedAt?: string;
}

type FilterType = "all" | "Full-time" | "Part-time" | "Contract";

export default function JobsPage() {
  const t = useTranslations("jobs");
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<JobData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  async function handleApply() {
    if (!applyingTo) return;
    if (!firstName || !lastName || !email || !phone) {
      toast.error(t("fillRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${applyingTo._id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, experience }),
      });
      if (res.ok) {
        toast.success(t("applicationSent"));
        setApplyingTo(null);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setExperience("");
      } else {
        const json = await res.json();
        toast.error(json.error || t("applicationFailed"));
      }
    } catch {
      toast.error(t("applicationFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  const filters: { label: string; value: FilterType }[] = [
    { label: t("allLocations"), value: "all" },
    { label: t("fullTime"), value: "Full-time" },
    { label: t("partTime"), value: "Part-time" },
  ];

  const filtered =
    activeFilter === "all"
      ? jobs
      : jobs.filter((j) => j.employmentType === activeFilter);

  const perks = [
    { icon: Heart, title: t("benefits"), description: t("healthBenefitsDesc") },
    { icon: UtensilsCrossed, title: t("meals"), description: t("freeMealsDesc") },
    { icon: TrendingUp, title: t("growth"), description: t("growthDesc") },
  ];

  function formatSalary(job: JobData): string | null {
    if (!job.salaryMin && !job.salaryMax) return null;
    if (job.salaryMin && job.salaryMax) return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`;
    return `Up to $${job.salaryMax!.toLocaleString()}`;
  }

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-16 text-center">
        <Badge variant="olive" className="mb-4">{t("hiring")}</Badge>
        <h1 className="mt-2 text-4xl font-semibold text-white">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-lg text-cream-400">{t("hiringDesc")}</p>
      </section>

      {/* Filter chips */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={activeFilter === f.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Job listings */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brown-400" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map((job, i) => {
              const salary = formatSalary(job);
              const desc = locale === "es" ? job.description.es : job.description.en;
              const reqs = locale === "es" ? job.requirements.es : job.requirements.en;

              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-6 pt-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-2">
                          <h3 className="text-lg font-semibold text-brown-900">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-brown-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-terracotta-500" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5 text-terracotta-500" />
                              {job.department} &middot; {job.employmentType}
                            </span>
                            {salary && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5 text-terracotta-500" />
                                {salary}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-brown-600">{desc}</p>
                          {reqs && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-brown-700">{t("requirements")}:</p>
                              <p className="text-xs text-brown-500">{reqs}</p>
                            </div>
                          )}
                        </div>
                        <Button variant="primary" size="md" className="shrink-0" onClick={() => setApplyingTo(job)}>
                          {t("applyNow")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <p className="py-12 text-center text-brown-500">{t("noOpenings")}</p>
            )}
          </div>
        )}
      </section>

      {/* Why Work With Us */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold text-brown-900">{t("whyWork")}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                >
                  <Card className="h-full text-center transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-3 p-6 pt-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500/10">
                        <Icon className="h-6 w-6 text-terracotta-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-brown-900">{perk.title}</h3>
                      <p className="text-sm text-brown-600">{perk.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Apply modal */}
      {applyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-brown-900">
                {t("applyFor")} {applyingTo.title}
              </h3>
              <button onClick={() => setApplyingTo(null)} className="text-brown-400 hover:text-brown-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label={t("firstName")} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                <Input label={t("lastName")} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
              <Input label={t("emailLabel")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <Input label={t("phoneLabel")} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
              <Textarea label={t("experienceLabel")} value={experience} onChange={(e) => setExperience(e.target.value)} placeholder={t("experiencePlaceholder")} rows={3} />
              <Button className="w-full" onClick={handleApply} loading={submitting}>
                {t("submitApplication")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
