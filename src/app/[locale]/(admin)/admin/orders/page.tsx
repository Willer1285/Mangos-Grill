"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Spinner,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { ChevronDown, ChevronUp, Package, Plus, X, Pencil, Ban } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer?: { firstName: string; lastName: string; email: string };
  items: OrderItem[];
  total: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  status: "New" | "Preparing" | "Ready" | "InTransit" | "Delivered" | "Cancelled";
  deliveryType: "Dine-in" | "Delivery" | "Pickup";
  deliveryAddress?: { street?: string; city?: string };
  tableNumber?: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: { en: string; es: string };
  price: number;
}

type StatusFilter = "All" | "New" | "Preparing" | "Ready" | "InTransit" | "Delivered" | "Cancelled";

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "New", label: "New" },
  { key: "Preparing", label: "Preparing" },
  { key: "Ready", label: "Ready" },
  { key: "Delivered", label: "Delivered" },
  { key: "Cancelled", label: "Cancelled" },
];

const badgeVariant: Record<string, string> = {
  New: "new",
  Preparing: "preparing",
  Ready: "ready",
  InTransit: "info",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [orderItems, setOrderItems] = useState<
    Array<{ productId: string; name: string; price: number; quantity: number }>
  >([]);
  const [orderForm, setOrderForm] = useState({
    deliveryType: "Dine-in",
    tableNumber: "",
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    notes: "",
    customerName: "",
  });

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState("");
  const [editItems, setEditItems] = useState<
    Array<{ productId: string; name: string; price: number; quantity: number }>
  >([]);
  const [editForm, setEditForm] = useState({
    deliveryType: "Dine-in",
    tableNumber: "",
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    notes: "",
  });
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const limit = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (filter !== "All") params.set("status", filter);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function changeStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchOrders();
    } catch {
      /* empty */
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancelOrder(orderId: string) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    await changeStatus(orderId, "Cancelled");
  }

  // Fetch products when the create or edit modal opens
  useEffect(() => {
    if (!createOpen && !editOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        if (!cancelled) setProducts(data.products ?? data);
      } catch {
        if (!cancelled) setProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createOpen, editOpen]);

  function openCreateModal() {
    setOrderItems([]);
    setOrderForm({
      deliveryType: "Dine-in",
      tableNumber: "",
      paymentMethod: "Cash",
      paymentStatus: "Pending",
      notes: "",
      customerName: "",
    });
    setCreateError("");
    setCreateOpen(true);
  }

  function openEditModal(order: Order) {
    setEditOrderId(order._id);
    setEditItems(
      order.items.map((i) => ({
        productId: i.product || "",
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }))
    );
    setEditForm({
      deliveryType: order.deliveryType,
      tableNumber: order.tableNumber || "",
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes || "",
    });
    setEditError("");
    setEditOpen(true);
  }

  // --- Shared product helpers ---
  function addProductTo(
    productId: string,
    setItems: React.Dispatch<React.SetStateAction<Array<{ productId: string; name: string; price: number; quantity: number }>>>
  ) {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, name: product.name.en, price: product.price, quantity: 1 }];
    });
  }

  function removeItemFrom(
    productId: string,
    setItems: React.Dispatch<React.SetStateAction<Array<{ productId: string; name: string; price: number; quantity: number }>>>
  ) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateItemQtyIn(
    productId: string,
    quantity: number,
    setItems: React.Dispatch<React.SetStateAction<Array<{ productId: string; name: string; price: number; quantity: number }>>>
  ) {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }

  const createSubtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const createTax = createSubtotal * 0.1;
  const createTotal = createSubtotal + createTax;

  const editSubtotal = editItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const editTax = editSubtotal * 0.1;
  const editTotal = editSubtotal + editTax;

  async function handleCreateOrder() {
    if (orderItems.length === 0) {
      setCreateError("Please add at least one product.");
      return;
    }
    setSubmitting(true);
    setCreateError("");
    try {
      const body = {
        customerName: orderForm.customerName || "Guest",
        items: orderItems.map((i) => ({
          product: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.price * i.quantity,
        })),
        deliveryType: orderForm.deliveryType,
        ...(orderForm.deliveryType === "Dine-in" && orderForm.tableNumber
          ? { tableNumber: orderForm.tableNumber }
          : {}),
        paymentMethod: orderForm.paymentMethod,
        paymentStatus: orderForm.paymentStatus,
        subtotal: createSubtotal,
        taxAmount: createTax,
        taxRate: 0.1,
        total: createTotal,
        notes: orderForm.notes,
      };
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create order");
      }
      setCreateOpen(false);
      fetchOrders();
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditOrder() {
    if (editItems.length === 0) {
      setEditError("Please add at least one product.");
      return;
    }
    setEditSubmitting(true);
    setEditError("");
    try {
      const body = {
        items: editItems.map((i) => ({
          product: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.price * i.quantity,
        })),
        deliveryType: editForm.deliveryType,
        ...(editForm.deliveryType === "Dine-in" && editForm.tableNumber
          ? { tableNumber: editForm.tableNumber }
          : { tableNumber: "" }),
        paymentMethod: editForm.paymentMethod,
        paymentStatus: editForm.paymentStatus,
        subtotal: editSubtotal,
        taxAmount: editTax,
        taxRate: 0.1,
        total: editTotal,
        notes: editForm.notes,
      };
      const res = await fetch(`/api/admin/orders/${editOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to update order");
      }
      setEditOpen(false);
      fetchOrders();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Failed to update order");
    } finally {
      setEditSubmitting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const nextStatus: Record<string, string> = {
    New: "Preparing",
    Preparing: "Ready",
    Ready: "Delivered",
  };

  // Shared items list renderer
  function renderItemsList(
    items: Array<{ productId: string; name: string; price: number; quantity: number }>,
    setItems: React.Dispatch<React.SetStateAction<Array<{ productId: string; name: string; price: number; quantity: number }>>>,
    subtotal: number
  ) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brown-500">Products</h3>
        <Select onValueChange={(v) => addProductTo(v, setItems)} value="">
          <SelectTrigger label="Add a product">
            <SelectValue placeholder="Select a product..." />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name.en} &mdash; ${p.price.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {items.length > 0 && (
          <div className="rounded-lg border border-cream-200 bg-cream-50/50">
            <div className="divide-y divide-cream-200">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-brown-900">{item.name}</span>
                    <span className="ml-2 text-xs text-brown-500">${item.price.toFixed(2)} each</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItemQtyIn(item.productId, parseInt(e.target.value, 10) || 1, setItems)
                    }
                    className="h-8 w-16 rounded-md border border-cream-300 bg-white px-2 text-center text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  />
                  <span className="w-20 text-right text-sm font-medium text-brown-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItemFrom(item.productId, setItems)}
                    className="rounded-md p-1 text-brown-400 transition-colors hover:bg-cream-200 hover:text-brown-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-200 px-4 py-2 text-right text-sm font-semibold text-brown-900">
              Subtotal: ${subtotal.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Shared order details form renderer
  function renderOrderDetailsForm<T extends { deliveryType: string; tableNumber: string; paymentMethod: string; paymentStatus: string; notes: string }>(
    form: T,
    setForm: React.Dispatch<React.SetStateAction<T>>,
    options?: { showCustomerName?: boolean; customerName?: string; onCustomerNameChange?: (v: string) => void }
  ) {
    return (
      <>
        <hr className="my-4 border-cream-200" />
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brown-500">Order Details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {options?.showCustomerName && (
              <Input
                label="Customer Name"
                placeholder="Guest"
                value={options.customerName || ""}
                onChange={(e) => options.onCustomerNameChange?.(e.target.value)}
              />
            )}
            <Select
              value={form.deliveryType}
              onValueChange={(v) => setForm((f) => ({ ...f, deliveryType: v }))}
            >
              <SelectTrigger label="Delivery Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dine-in">Dine-in</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
                <SelectItem value="Pickup">Pickup</SelectItem>
              </SelectContent>
            </Select>
            {form.deliveryType === "Dine-in" && (
              <Input
                label="Table Number"
                placeholder="e.g. 5"
                value={form.tableNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tableNumber: e.target.value }))
                }
              />
            )}
          </div>
          <Textarea
            label="Notes"
            placeholder="Special instructions..."
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
            rows={2}
          />
        </div>

        <hr className="my-4 border-cream-200" />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brown-500">Payment</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={form.paymentMethod}
              onValueChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}
            >
              <SelectTrigger label="Payment Method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
                <SelectItem value="Amex">Amex</SelectItem>
                <SelectItem value="Zelle">Zelle</SelectItem>
                <SelectItem value="Binance">Binance</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.paymentStatus}
              onValueChange={(v) => setForm((f) => ({ ...f, paymentStatus: v }))}
            >
              <SelectTrigger label="Payment Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </>
    );
  }

  // Shared summary renderer
  function renderSummary(subtotal: number, tax: number, totalAmount: number) {
    return (
      <>
        <hr className="my-4 border-cream-200" />
        <div className="rounded-lg bg-cream-50 px-4 py-3 text-sm">
          <div className="flex justify-between text-brown-700">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-brown-700">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-cream-200 pt-1 font-semibold text-brown-900">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-brown-900">Orders Management</h1>
          <span className="text-sm text-brown-500">{total} total orders</span>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((sf) => (
          <button
            key={sf.key}
            onClick={() => setFilter(sf.key)}
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === sf.key
                ? "bg-terracotta-500 text-white"
                : "border border-cream-200 bg-white text-brown-600 hover:bg-cream-100"
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-brown-500">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-200">
                    <th className="w-10 px-5 py-3 text-left text-xs font-medium text-brown-500" />
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Order #</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Customer</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Items</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Total</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Date</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const isExpanded = expandedRows.has(order._id);
                    const customerName = order.customer
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : "Guest";
                    const itemsSummary = order.items.map((i) => i.name).join(", ");
                    const isNew = order.status === "New";
                    return (
                      <Fragment key={order._id}>
                        <tr
                          className="cursor-pointer border-b border-cream-100 transition-colors hover:bg-cream-50"
                          onClick={() => toggleRow(order._id)}
                        >
                          <td className="w-10 px-5 py-3 text-brown-400">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </td>
                          <td className="px-5 py-3 font-medium text-brown-900">{order.orderNumber}</td>
                          <td className="px-5 py-3 text-brown-700">{customerName}</td>
                          <td className="max-w-[200px] truncate px-5 py-3 text-brown-600">{itemsSummary}</td>
                          <td className="px-5 py-3 text-right font-medium text-brown-900">${order.total.toFixed(2)}</td>
                          <td className="px-5 py-3 text-center">
                            <Badge variant={badgeVariant[order.status] as "new" | "preparing" | "ready" | "delivered" | "cancelled"}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-brown-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              {isNew && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => openEditModal(order)}
                                  title="Edit order"
                                >
                                  <Pencil className="h-4 w-4 text-brown-500" />
                                </Button>
                              )}
                              {nextStatus[order.status] && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={updatingId === order._id}
                                  onClick={() => changeStatus(order._id, nextStatus[order.status])}
                                  title={`Move to ${nextStatus[order.status]}`}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                              )}
                              {isNew && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={updatingId === order._id}
                                  onClick={() => handleCancelOrder(order._id)}
                                  title="Cancel order"
                                >
                                  <Ban className="h-4 w-4 text-error-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-b border-cream-100 bg-cream-50/50">
                            <td colSpan={8} className="px-5 py-4">
                              <div className="grid gap-6 md:grid-cols-3">
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Order Details</h4>
                                  <ul className="space-y-1">
                                    {order.items.map((item, idx) => (
                                      <li key={idx} className="flex justify-between text-sm">
                                        <span className="text-brown-700">{item.quantity}x {item.name}</span>
                                        <span className="font-medium text-brown-900">${item.subtotal.toFixed(2)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Delivery Info</h4>
                                  <p className="text-sm text-brown-700"><span className="font-medium">Type:</span> {order.deliveryType}</p>
                                  {order.deliveryAddress && (
                                    <p className="text-sm text-brown-700"><span className="font-medium">Address:</span> {order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
                                  )}
                                  {order.tableNumber && (
                                    <p className="text-sm text-brown-700"><span className="font-medium">Table:</span> {order.tableNumber}</p>
                                  )}
                                </div>
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Payment Info</h4>
                                  <p className="text-sm text-brown-700"><span className="font-medium">Method:</span> {order.paymentMethod}</p>
                                  <p className="text-sm text-brown-700"><span className="font-medium">Status:</span> {order.paymentStatus}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Create Order Modal */}
      <Modal open={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Create Order</ModalTitle>
            <ModalDescription>
              Create a manual order with product selection and payment details.
            </ModalDescription>
          </ModalHeader>

          {renderItemsList(orderItems, setOrderItems, createSubtotal)}
          {renderOrderDetailsForm(orderForm, setOrderForm, {
            showCustomerName: true,
            customerName: orderForm.customerName,
            onCustomerNameChange: (v) => setOrderForm((f) => ({ ...f, customerName: v })),
          })}
          {renderSummary(createSubtotal, createTax, createTotal)}

          {createError && (
            <p className="mt-2 text-sm text-red-600">{createError}</p>
          )}

          <ModalFooter>
            <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} loading={submitting} disabled={orderItems.length === 0}>
              Create Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Order Modal */}
      <Modal open={editOpen} onOpenChange={setEditOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Edit Order</ModalTitle>
            <ModalDescription>
              Modify items, delivery, and payment details for this order.
            </ModalDescription>
          </ModalHeader>

          {renderItemsList(editItems, setEditItems, editSubtotal)}
          {renderOrderDetailsForm(editForm, setEditForm)}
          {renderSummary(editSubtotal, editTax, editTotal)}

          {editError && (
            <p className="mt-2 text-sm text-red-600">{editError}</p>
          )}

          <ModalFooter>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={editSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditOrder} loading={editSubmitting} disabled={editItems.length === 0}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
