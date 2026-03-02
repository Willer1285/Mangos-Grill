"use client";

import { useState } from "react";
import { Card, CardContent, Badge, Button, Input, Pagination } from "@/components/ui";
import { FileDown, CheckCircle, XCircle, Search, DollarSign } from "lucide-react";

/* ── Mock data ── */
const transactions = [
  {
    id: "TXN-001",
    customer: "John Doe",
    amount: 38.5,
    status: "completed" as const,
    date: "2026-03-02",
    method: "Credit Card",
  },
  {
    id: "TXN-002",
    customer: "Ana Lopez",
    amount: 32.0,
    status: "pending" as const,
    date: "2026-03-02",
    method: "Zelle",
  },
  {
    id: "TXN-003",
    customer: "Carlos Rivera",
    amount: 42.75,
    status: "completed" as const,
    date: "2026-03-01",
    method: "Credit Card",
  },
  {
    id: "TXN-004",
    customer: "Maria Gonzalez",
    amount: 28.5,
    status: "failed" as const,
    date: "2026-03-01",
    method: "Credit Card",
  },
  {
    id: "TXN-005",
    customer: "Luis Perez",
    amount: 22.99,
    status: "refunded" as const,
    date: "2026-02-28",
    method: "Credit Card",
  },
  {
    id: "TXN-006",
    customer: "Sofia Martinez",
    amount: 56.0,
    status: "pending" as const,
    date: "2026-03-02",
    method: "Binance Pay",
  },
  {
    id: "TXN-007",
    customer: "Diego Fernandez",
    amount: 19.99,
    status: "completed" as const,
    date: "2026-02-27",
    method: "Zelle",
  },
];

type StatusFilter = "all" | "pending" | "completed" | "failed" | "refunded";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const statusLabels: Record<string, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

export default function PaymentProcessingPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = transactions.filter((txn) => {
    if (statusFilter !== "all" && txn.status !== statusFilter) return false;
    if (dateFrom && txn.date < dateFrom) return false;
    if (dateTo && txn.date > dateTo) return false;
    return true;
  });

  const pendingManual = transactions.filter(
    (txn) =>
      txn.status === "pending" &&
      (txn.method === "Zelle" || txn.method === "Binance Pay")
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Payment Processing</h1>
        <Button variant="secondary" size="sm">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-brown-800">
                From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-brown-800">
                To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-brown-800">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex h-10 w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-sm text-brown-900 transition-colors focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="secondary" size="md">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-brown-900">Transactions</h2>
            <div className="flex items-center gap-2 text-sm text-brown-500">
              <DollarSign className="h-4 w-4" />
              {filtered.length} transaction{filtered.length !== 1 && "s"}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">TXN ID</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Customer</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Amount</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => (
                  <tr key={txn.id} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                    <td className="px-5 py-3 font-medium text-brown-900">{txn.id}</td>
                    <td className="px-5 py-3 text-brown-700">{txn.customer}</td>
                    <td className="px-5 py-3 text-right font-medium text-brown-900">
                      ${txn.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={txn.status}>{statusLabels[txn.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-brown-600">{txn.date}</td>
                    <td className="px-5 py-3 text-brown-600">{txn.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center border-t border-cream-200 px-5 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={3}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Manual Payments */}
      {pendingManual.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-500/10">
                <DollarSign className="h-5 w-5 text-warning-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brown-900">Manual Payment Approvals</h3>
                <p className="text-sm text-brown-500">
                  Pending manual payments require admin approval
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {pendingManual.map((txn) => (
                <div
                  key={txn.id}
                  className="flex flex-col gap-3 rounded-lg border border-cream-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-brown-900">
                      {txn.customer} &mdash; {txn.id}
                    </p>
                    <p className="text-sm text-brown-500">
                      {txn.method} &middot; ${txn.amount.toFixed(2)} &middot; {txn.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm">
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button variant="destructive" size="sm">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
