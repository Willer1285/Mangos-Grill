"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema, type ReservationInput } from "@/lib/validators/reservation";
import { OCCASIONS } from "@/lib/constants";
import { Button, Input, Textarea, Card, CardContent } from "@/components/ui";
import { CalendarDays, Clock, Phone, Mail, MapPin } from "lucide-react";
import { InteractiveTableMap } from "./_components/interactive-table-map";
import { toast } from "sonner";

const timeSlots = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM",
  "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM",
];

const partySizes = [1, 2, 3, 4, 5, 6, 7];

const openingHours = [
  { day: "Monday", hours: "11:00 AM - 10:00 PM" },
  { day: "Tuesday", hours: "11:00 AM - 10:00 PM" },
  { day: "Wednesday", hours: "11:00 AM - 10:00 PM" },
  { day: "Thursday", hours: "11:00 AM - 10:00 PM" },
  { day: "Friday", hours: "11:00 AM - 11:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 11:00 PM" },
  { day: "Sunday", hours: "10:00 AM - 9:00 PM" },
];

export default function ReservationsPage() {
  const t = useTranslations("reservations");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPartySize, setSelectedPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      partySize: 2,
      location: "Houston - Montrose District",
    },
  });

  async function onSubmit(data: ReservationInput) {
    setLoading(true);
    try {
      // TODO: API call to create reservation
      toast.success("Reservation confirmed! Check your email for details.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <section className="bg-brown-900 py-12 text-center">
        <h1 className="text-4xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 text-cream-400">{t("subtitle")}</p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Reservation form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date */}
              <Input
                label={t("date")}
                type="date"
                min={new Date().toISOString().split("T")[0]}
                error={errors.date?.message}
                {...register("date")}
              />

              {/* Time slots */}
              <div>
                <label className="mb-2 block text-sm font-medium text-brown-800">
                  {t("time")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedTime === slot
                          ? "bg-terracotta-500 text-white"
                          : "border border-cream-300 text-brown-700 hover:bg-cream-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <input type="hidden" value={selectedTime} {...register("time")} />
                {errors.time && (
                  <p className="mt-1 text-xs text-error-500">{errors.time.message}</p>
                )}
              </div>

              {/* Party size */}
              <div>
                <label className="mb-2 block text-sm font-medium text-brown-800">
                  {t("partySize")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {partySizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedPartySize(size)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        selectedPartySize === size
                          ? "bg-terracotta-500 text-white"
                          : "border border-cream-300 text-brown-700 hover:bg-cream-200"
                      }`}
                    >
                      {size === 7 ? "7+" : size}
                    </button>
                  ))}
                </div>
                <input type="hidden" value={selectedPartySize} {...register("partySize", { valueAsNumber: true })} />
              </div>

              {/* Interactive Table Map */}
              <div>
                <label className="mb-2 block text-sm font-medium text-brown-800">
                  {t("selectTable")}
                </label>
                <InteractiveTableMap
                  selectedTable={selectedTable}
                  onSelectTable={(id) => setSelectedTable(id)}
                  partySize={selectedPartySize}
                />
                <input type="hidden" value={selectedTable || ""} {...register("tableId")} />
              </div>

              {/* Personal info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t("fullName")}
                  placeholder="John Doe"
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />
                <Input
                  label={t("email")}
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <Input
                label={t("phone")}
                type="tel"
                placeholder="+1 (555) 123-4567"
                error={errors.phone?.message}
                {...register("phone")}
              />

              {/* Occasion chips */}
              <div>
                <label className="mb-2 block text-sm font-medium text-brown-800">
                  {t("occasion")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setSelectedOccasion(occ === selectedOccasion ? "" : occ)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedOccasion === occ
                          ? "bg-terracotta-500 text-white"
                          : "border border-cream-300 text-brown-700 hover:bg-cream-200"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special requests */}
              <Textarea
                label={t("specialRequests")}
                placeholder={t("specialRequestsPlaceholder")}
                {...register("specialRequests")}
              />

              <input type="hidden" value="Houston - Montrose District" {...register("location")} />

              <Button type="submit" size="lg" className="w-full gap-2" loading={loading}>
                <CalendarDays className="h-5 w-5" />
                {t("confirmReservation")}
              </Button>
            </form>
          </div>

          {/* Right sidebar */}
          <aside className="w-full shrink-0 space-y-6 lg:w-72">
            {/* Opening Hours */}
            <Card>
              <CardContent className="p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-brown-900">
                  <Clock className="h-4 w-4 text-terracotta-500" />
                  {t("openingHours")}
                </h3>
                <div className="mt-3 space-y-2">
                  {openingHours.map((item) => (
                    <div key={item.day} className="flex justify-between text-xs">
                      <span className="font-medium text-brown-700">{item.day}</span>
                      <span className="text-brown-600">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact info */}
            <Card>
              <CardContent className="p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-brown-900">
                  {t("contactUs")}
                </h3>
                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 text-terracotta-500" />
                    <span className="text-xs text-brown-700">(713) 555-0199</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-terracotta-500" />
                    <span className="text-xs text-brown-700">hello@mangosgrill.com</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-terracotta-500" />
                    <span className="text-xs text-brown-700">
                      1547 Westheimer Rd, Houston, TX 77098
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
