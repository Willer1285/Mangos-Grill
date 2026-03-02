"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { MapPin, Edit2, Trash2, Plus } from "lucide-react";

/* Mock data — will be fetched from API in production */
const mockAddresses = [
  {
    id: 1,
    type: "Home",
    isDefault: true,
    fullName: "John Doe",
    street: "1234 Elm Street, Apt 5B",
    city: "Houston",
    state: "TX",
    zip: "77006",
    phone: "(713) 555-0192",
  },
  {
    id: 2,
    type: "Office",
    isDefault: false,
    fullName: "John Doe",
    street: "500 Westheimer Rd, Suite 200",
    city: "Houston",
    state: "TX",
    zip: "77027",
    phone: "(713) 555-0284",
  },
  {
    id: 3,
    type: "Other",
    isDefault: false,
    fullName: "John Doe",
    street: "8720 Katy Freeway",
    city: "Houston",
    state: "TX",
    zip: "77024",
    phone: "(713) 555-0371",
  },
];

export default function AddressesPage() {
  const t = useTranslations("customer");
  const ct = useTranslations("common");

  const [addresses, setAddresses] = useState(mockAddresses);
  const [editingAddress, setEditingAddress] = useState<typeof mockAddresses[number] | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleDelete(id: number) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  function handleEdit(address: typeof mockAddresses[number]) {
    setEditingAddress(address);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingAddress(null);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingAddress(null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">My Addresses</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          {t("addAddress")}
        </Button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {addresses.map((address, i) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="relative border border-cream-200">
              <CardContent className="p-5">
                {/* Type + Default badges */}
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="primary">{address.type}</Badge>
                  {address.isDefault && (
                    <Badge variant="success">{t("defaultAddress")}</Badge>
                  )}
                </div>

                {/* Address details */}
                <div className="space-y-1 text-sm text-brown-600">
                  <p className="font-medium text-brown-900">{address.fullName}</p>
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terracotta-500" />
                    {address.street}
                  </p>
                  <p className="pl-5">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="pl-5">{address.phone}</p>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex items-center gap-2 border-t border-cream-200 pt-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(address)}
                    aria-label={ct("edit")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(address.id)}
                    aria-label={ct("delete")}
                  >
                    <Trash2 className="h-4 w-4 text-error-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add / Edit Address Modal Placeholder */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg shadow-xl">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-brown-900">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-brown-700">Full Name</label>
                  <input
                    type="text"
                    defaultValue={editingAddress?.fullName ?? ""}
                    className="w-full rounded-md border border-cream-200 px-3 py-2 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-brown-700">Street Address</label>
                  <input
                    type="text"
                    defaultValue={editingAddress?.street ?? ""}
                    className="w-full rounded-md border border-cream-200 px-3 py-2 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-brown-700">City</label>
                    <input
                      type="text"
                      defaultValue={editingAddress?.city ?? ""}
                      className="w-full rounded-md border border-cream-200 px-3 py-2 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-brown-700">State</label>
                    <input
                      type="text"
                      defaultValue={editingAddress?.state ?? ""}
                      className="w-full rounded-md border border-cream-200 px-3 py-2 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-brown-700">ZIP</label>
                    <input
                      type="text"
                      defaultValue={editingAddress?.zip ?? ""}
                      className="w-full rounded-md border border-cream-200 px-3 py-2 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-brown-700">Phone</label>
                  <input
                    type="text"
                    defaultValue={editingAddress?.phone ?? ""}
                    className="w-full rounded-md border border-cream-200 px-3 py-2 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" size="sm" onClick={handleCloseForm}>
                  {ct("cancel")}
                </Button>
                <Button size="sm" onClick={handleCloseForm}>
                  {ct("save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
