"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Pagination,
  Spinner,
} from "@/components/ui";
import { FileDown, CheckCircle, XCircle, Search, DollarSign } from "lucide-react";

interface Payment {
  _id: string;
  transactionId: string;
  order?: { orderNumber: string };
  customer?: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed" | "Refunded";
  method: string;
  createdAt: string;
}

type StatusFilter = "All" | "Pending" | "Completed" | "Failed" | "Refunded";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Failed", label: "Failed" },
  { value: "Refunded", label: "Refunded" },
];

const badgeVariant: Record<string, string> = {
  Pending: "pending",
  Completed: "completed",
  Failed: "failed",
  Refunded: "refunded",
};

export default function PaymentProcessingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);
  const limit = 20;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (dateFrom) params.set("startDate", dateFrom);
      if (dateTo) params.set("endDate", dateTo);

      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPayments(data.payments);
      setTotal(data.total);
    } catch {
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dateFrom, dateTo, limit]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFrom, dateTo]);

  async function handleAction(paymentId: string, action: "approve" | "reject") {
    setActionId(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) fetchPayments();
    } catch {
      /* empty */
    } finally {
      setActionId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pendingManual = payments.filter(
    (p) => p.status === "Pending" && ["Zelle", "Binance", "Cash"].includes(p.method)
  );

  return (
    <div className="space-y-6">
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
              <label className="mb-1.5 block text-sm font-medium text-brown-800">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-brown-800">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-brown-800">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex h-10 w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-sm text-brown-900 transition-colors focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
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
              {total} transaction{total !== 1 && "s"}
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-20 text-center text-brown-500">No payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-200">
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">TXN ID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Order</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Amount</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((txn) => (
                    <tr key={txn._id} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                      <td className="px-5 py-3 font-medium text-brown-900">{txn.transactionId}</td>
                      <td className="px-5 py-3 text-brown-700">{txn.order?.orderNumber || "—"}</td>
                      <td className="px-5 py-3 text-right font-medium text-brown-900">${txn.amount.toFixed(2)}</td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant={badgeVariant[txn.status] as "pending" | "completed" | "failed"}>{txn.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-brown-600">{new Date(txn.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-brown-600">{txn.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center border-t border-cream-200 px-5 py-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
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
                <p className="text-sm text-brown-500">Pending manual payments require admin approval</p>
              </div>
            </div>
            <div className="space-y-3">
              {pendingManual.map((txn) => (
                <div key={txn._id} className="flex flex-col gap-3 rounded-lg border border-cream-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium text-brown-900">{txn.transactionId} &mdash; {txn.order?.orderNumber || ""}</p>
                    <p className="text-sm text-brown-500">{txn.method} &middot; ${txn.amount.toFixed(2)} &middot; {new Date(txn.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={actionId === txn._id}
                      onClick={() => handleAction(txn._id, "approve")}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionId === txn._id}
                      onClick={() => handleAction(txn._id, "reject")}
                    >
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
