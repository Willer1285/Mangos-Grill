"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Pagination,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui";
import { FileDown, CheckCircle, XCircle, DollarSign, Eye, X } from "lucide-react";
import { useBrand, formatPrice, formatDate } from "@/lib/brand/brand-context";
import { toast } from "sonner";

interface PaymentOrder {
  _id: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number; subtotal: number }[];
  deliveryType: string;
  location: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
}

interface PaymentCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Payment {
  _id: string;
  transactionId: string;
  order?: PaymentOrder;
  customer?: PaymentCustomer;
  amount: number;
  status: "Completed" | "Pending" | "Failed" | "Refunded";
  method: string;
  methodType: string;
  referenceNumber?: string;
  receiptImage?: string;
  stripePaymentIntentId?: string;
  approvedBy?: { firstName: string; lastName: string };
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
  const { currency, timezone } = useBrand();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [receiptZoom, setReceiptZoom] = useState(false);
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
      if (res.ok) {
        toast.success(action === "approve" ? "Payment approved" : "Payment rejected");
        fetchPayments();
        if (detailPayment?._id === paymentId) {
          setDetailPayment(null);
        }
      }
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setActionId(null);
    }
  }

  async function openDetail(paymentId: string) {
    setDetailLoading(true);
    setDetailPayment(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`);
      if (res.ok) {
        const data = await res.json();
        setDetailPayment(data);
      }
    } catch {
      toast.error("Failed to load payment details");
    } finally {
      setDetailLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pendingManual = payments.filter(
    (p) => p.status === "Pending" && p.methodType === "manual"
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

      {/* Pending Manual Payments */}
      {pendingManual.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-500/10">
                <DollarSign className="h-5 w-5 text-warning-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brown-900">Pending Approvals</h3>
                <p className="text-sm text-brown-500">Manual payments waiting for admin review</p>
              </div>
            </div>
            <div className="space-y-3">
              {pendingManual.map((txn) => (
                <div key={txn._id} className="flex flex-col gap-3 rounded-lg border border-cream-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium text-brown-900">
                      {txn.transactionId} &mdash; {txn.order?.orderNumber || ""}
                    </p>
                    <p className="text-sm text-brown-500">
                      {txn.method} &middot; {formatPrice(txn.amount, currency)} &middot; {formatDate(txn.createdAt, timezone)}
                    </p>
                    {txn.customer && (
                      <p className="text-xs text-brown-400">
                        {txn.customer.firstName} {txn.customer.lastName} ({txn.customer.email})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openDetail(txn._id)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
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
                    <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((txn) => (
                    <tr key={txn._id} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                      <td className="px-5 py-3 font-medium text-brown-900">
                        <span className="max-w-[140px] truncate block" title={txn.transactionId}>
                          {txn.transactionId}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-brown-700">{txn.order?.orderNumber || "—"}</td>
                      <td className="px-5 py-3 text-right font-medium text-brown-900">{formatPrice(txn.amount, currency)}</td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant={badgeVariant[txn.status] as "pending" | "completed" | "failed"}>{txn.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-brown-600">{formatDate(txn.createdAt, timezone)}</td>
                      <td className="px-5 py-3 text-brown-600">{txn.method}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openDetail(txn._id)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {txn.status === "Pending" && txn.methodType === "manual" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={actionId === txn._id}
                                onClick={() => handleAction(txn._id, "approve")}
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4 text-success-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={actionId === txn._id}
                                onClick={() => handleAction(txn._id, "reject")}
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4 text-error-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
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

      {/* Transaction Detail Modal */}
      <Modal open={!!detailPayment || detailLoading} onOpenChange={(open) => { if (!open) { setDetailPayment(null); setReceiptZoom(false); } }}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Transaction Details</ModalTitle>
            <ModalDescription>
              {detailPayment ? `TXN: ${detailPayment.transactionId}` : "Loading..."}
            </ModalDescription>
          </ModalHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : detailPayment ? (
            <div className="space-y-5">
              {/* Payment Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-cream-200 p-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Payment</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brown-600">TXN ID</span>
                      <span className="font-medium text-brown-900 max-w-[200px] truncate" title={detailPayment.transactionId}>
                        {detailPayment.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brown-600">Method</span>
                      <span className="font-medium text-brown-900">{detailPayment.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brown-600">Type</span>
                      <span className="font-medium text-brown-900 capitalize">{detailPayment.methodType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brown-600">Amount</span>
                      <span className="font-medium text-brown-900">{formatPrice(detailPayment.amount, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brown-600">Status</span>
                      <Badge variant={badgeVariant[detailPayment.status] as "pending" | "completed" | "failed"}>
                        {detailPayment.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brown-600">Date</span>
                      <span className="text-brown-900">{formatDate(detailPayment.createdAt, timezone)}</span>
                    </div>
                    {detailPayment.referenceNumber && (
                      <div className="flex justify-between">
                        <span className="text-brown-600">Reference #</span>
                        <span className="font-medium text-brown-900">{detailPayment.referenceNumber}</span>
                      </div>
                    )}
                    {detailPayment.stripePaymentIntentId && (
                      <div className="flex justify-between">
                        <span className="text-brown-600">Stripe PI</span>
                        <span className="font-mono text-xs text-brown-900 max-w-[160px] truncate" title={detailPayment.stripePaymentIntentId}>
                          {detailPayment.stripePaymentIntentId}
                        </span>
                      </div>
                    )}
                    {detailPayment.approvedBy && (
                      <div className="flex justify-between">
                        <span className="text-brown-600">Approved by</span>
                        <span className="text-brown-900">
                          {detailPayment.approvedBy.firstName} {detailPayment.approvedBy.lastName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Customer */}
                  <div className="rounded-lg border border-cream-200 p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Customer</h4>
                    {detailPayment.customer ? (
                      <div className="text-sm">
                        <p className="font-medium text-brown-900">
                          {detailPayment.customer.firstName} {detailPayment.customer.lastName}
                        </p>
                        <p className="text-brown-600">{detailPayment.customer.email}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-brown-400">—</p>
                    )}
                  </div>

                  {/* Order */}
                  <div className="rounded-lg border border-cream-200 p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Order</h4>
                    {detailPayment.order ? (
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-brown-600">Order #</span>
                          <span className="font-medium text-brown-900">{detailPayment.order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brown-600">Delivery</span>
                          <span className="text-brown-900">{detailPayment.order.deliveryType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brown-600">Location</span>
                          <span className="text-brown-900">{detailPayment.order.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brown-600">Total</span>
                          <span className="font-medium text-brown-900">
                            {formatPrice(detailPayment.order.total, currency)}
                          </span>
                        </div>
                        {detailPayment.order.items && detailPayment.order.items.length > 0 && (
                          <div className="mt-2 border-t border-cream-200 pt-2">
                            <p className="mb-1 text-xs font-medium text-brown-500">Items</p>
                            {detailPayment.order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs text-brown-600">
                                <span>{item.quantity}x {item.name}</span>
                                <span>{formatPrice(item.subtotal, currency)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-brown-400">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Receipt Image */}
              {detailPayment.receiptImage && (
                <div className="rounded-lg border border-cream-200 p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-brown-500">Receipt</h4>
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-lg border border-cream-200 bg-white"
                    onClick={() => setReceiptZoom(true)}
                  >
                    <div className="relative aspect-video w-full">
                      <Image
                        src={detailPayment.receiptImage}
                        alt="Payment receipt"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity hover:bg-black/10 hover:opacity-100">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-brown-900 shadow">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <ModalFooter>
            {detailPayment?.status === "Pending" && detailPayment?.methodType === "manual" && (
              <>
                <Button
                  variant="primary"
                  disabled={actionId === detailPayment._id}
                  onClick={() => handleAction(detailPayment._id, "approve")}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  disabled={actionId === detailPayment._id}
                  onClick={() => handleAction(detailPayment._id, "reject")}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={() => { setDetailPayment(null); setReceiptZoom(false); }}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Receipt Zoom Modal */}
      {receiptZoom && detailPayment?.receiptImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setReceiptZoom(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/40"
            onClick={() => setReceiptZoom(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={detailPayment.receiptImage}
              alt="Payment receipt full size"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
