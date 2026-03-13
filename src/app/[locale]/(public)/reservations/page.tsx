"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema, type ReservationInput } from "@/lib/validators/reservation";
import { OCCASIONS } from "@/lib/constants";
import { Button, Input, Textarea, Card, CardContent } from "@/components/ui";
import { CalendarDays, Clock, Phone, Mail, MapPin, Users, Sparkles, LogIn, UtensilsCrossed } from "lucide-react";
import { InteractiveTableMap } from "./_components/interactive-table-map";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";

interface LocationData {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  hours?: { day: string; open: string; close: string; closed: boolean }[];
}

const partySizes = [1, 2, 3, 4, 5, 6, 7];

function generateTimeSlots(openTime?: string, closeTime?: string): string[] {
  const slots: string[] = [];
  const parseTime = (t: string): number => {
    const [time, period] = t.trim().split(" ");
    const [h, m] = time.split(":").map(Number);
    let hours = h;
    if (period?.toUpperCase() === "PM" && h !== 12) hours += 12;
    if (period?.toUpperCase() === "AM" && h === 12) hours = 0;
    return hours * 60 + (m || 0);
  };
  const formatTime = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const start = openTime ? parseTime(openTime) : 11 * 60;
  const end = closeTime ? parseTime(closeTime) - 60 : 21 * 60;

  for (let t = start; t <= end; t += 30) {
    slots.push(formatTime(t));
  }
  return slots.length > 0 ? slots : ["11:00 AM", "12:00 PM", "1:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
}

export default function ReservationsPage() {
  const t = useTranslations("reservations");
  const tc = useTranslations("common");
  const { data: session, status: authStatus } = useSession();

  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPartySize, setSelectedPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      partySize: 2,
      location: "",
    },
  });

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
          if (data.length === 1) {
            setSelectedLocation(data[0].name);
            setValue("location", data[0].name);
          }
        }
      } catch {
        /* empty */
      }
    }
    fetchLocations();
  }, [setValue]);

  function handleLocationSelect(locationName: string) {
    setSelectedLocation(locationName);
    setValue("location", locationName);
    setSelectedTable(null);
    setSelectedTime("");
  }

  async function onSubmit(data: ReservationInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(t("confirmed"));
        reset();
        setSelectedTime("");
        setSelectedTable(null);
        setSelectedOccasion("");
        setSelectedPartySize(2);
        setCurrentStep(1);
      } else {
        const json = await res.json();
        toast.error(json.error || t("failedCreate"));
      }
    } catch {
      toast.error(t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  const currentLocation = locations.find((l) => l.name === selectedLocation);

  const selectedDayOfWeek = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })
    : "";
  const dayHours = currentLocation?.hours?.find((h) => h.day === selectedDayOfWeek);
  const timeSlots = dayHours && !dayHours.closed
    ? generateTimeSlots(dayHours.open, dayHours.close)
    : generateTimeSlots();

  const openingHours = currentLocation?.hours?.length
    ? currentLocation.hours.map((h) => ({
        day: h.day,
        hours: h.closed ? tc("closed") : `${h.open} - ${h.close}`,
        closed: h.closed,
      }))
    : [];

  const isAuthenticated = authStatus === "authenticated" && !!session?.user;
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  function handleFormSubmit(data: ReservationInput) {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    onSubmit(data);
  }

  return (
    <>
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowLoginPrompt(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-terracotta-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 bg-gradient-to-r from-brown-800 to-brown-900 px-6 py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta-500 shadow-lg">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {t("loginRequiredTitle")}
                </h2>
                <p className="mt-0.5 text-sm text-cream-100">
                  {t("loginRequiredDesc")}
                </p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="flex-1">
                  <Button size="lg" className="w-full gap-2 shadow-md shadow-terracotta-500/20">
                    <LogIn className="h-4 w-4" />
                    {tc("login")}
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full">
                    {tc("register")}
                  </Button>
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="w-full text-center text-sm text-brown-500 hover:text-brown-700 transition-colors"
              >
                {tc("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brown-900 via-brown-800 to-brown-900 py-16 text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-terracotta-500/30 bg-terracotta-500/10 px-4 py-1.5">
            <UtensilsCrossed className="h-4 w-4 text-terracotta-400" />
            <span className="text-sm font-medium text-terracotta-400">{t("title")}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-cream-100">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Main Reservation Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-0">

              {/* Step 1: Location & Date */}
              <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-cream-100 bg-gradient-to-r from-brown-800 to-brown-900 px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-500 text-sm font-bold text-white">1</div>
                  <h2 className="text-lg font-semibold text-white">{t("selectLocation") || "Location & Date"}</h2>
                </div>
                <div className="space-y-6 p-6">
                  {/* Location Selector */}
                  {locations.length > 0 && (
                    <div>
                      <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-brown-800">
                        <MapPin className="h-4 w-4 text-terracotta-500" />
                        {t("selectLocation")}
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {locations.map((loc) => (
                          <button
                            key={loc._id}
                            type="button"
                            onClick={() => handleLocationSelect(loc.name)}
                            className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                              selectedLocation === loc.name
                                ? "border-terracotta-500 bg-gradient-to-br from-terracotta-50 to-terracotta-100/50 shadow-md shadow-terracotta-500/10"
                                : "border-cream-200 bg-white hover:border-terracotta-300 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                selectedLocation === loc.name
                                  ? "bg-terracotta-500 text-white"
                                  : "bg-cream-100 text-brown-500 group-hover:bg-terracotta-100 group-hover:text-terracotta-600"
                              }`}>
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-brown-900">{loc.name}</span>
                                <span className="mt-1 block text-xs text-brown-500">{loc.address}</span>
                              </div>
                            </div>
                            {selectedLocation === loc.name && (
                              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta-500">
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <input type="hidden" value={selectedLocation} {...register("location")} />
                      {errors.location && (
                        <p className="mt-2 text-xs font-medium text-error-500">{errors.location.message}</p>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-brown-800">
                      <CalendarDays className="h-4 w-4 text-terracotta-500" />
                      {t("date")}
                    </label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      error={errors.date?.message}
                      className="h-12 rounded-xl border-cream-300 bg-cream-50/50 text-brown-900 transition-all focus:border-terracotta-500 focus:bg-white focus:ring-2 focus:ring-terracotta-500/20"
                      {...register("date", {
                        onChange: (e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime("");
                        },
                      })}
                    />
                  </div>

                  {/* Time slots */}
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-brown-800">
                      <Clock className="h-4 w-4 text-terracotta-500" />
                      {t("time")}
                    </label>
                    {dayHours?.closed ? (
                      <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3">
                        <p className="text-sm font-medium text-warning-700">{tc("closed")}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedTime(slot);
                              setValue("time", slot);
                            }}
                            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                              selectedTime === slot
                                ? "bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-md shadow-terracotta-500/25 scale-[1.02]"
                                : "border border-cream-200 bg-white text-brown-700 hover:border-terracotta-300 hover:bg-terracotta-50 hover:text-terracotta-700"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                    <input type="hidden" value={selectedTime} {...register("time")} />
                    {errors.time && (
                      <p className="mt-2 text-xs font-medium text-error-500">{errors.time.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Party Size & Table */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-cream-100 bg-gradient-to-r from-brown-800 to-brown-900 px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-500 text-sm font-bold text-white">2</div>
                  <h2 className="text-lg font-semibold text-white">{t("partySize") || "Party & Table"}</h2>
                </div>
                <div className="space-y-6 p-6">
                  {/* Party size */}
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-brown-800">
                      <Users className="h-4 w-4 text-terracotta-500" />
                      {t("partySize")}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {partySizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedPartySize(size);
                            setValue("partySize", size);
                            setSelectedTable(null);
                          }}
                          className={`flex h-14 w-14 items-center justify-center rounded-xl text-base font-bold transition-all duration-200 ${
                            selectedPartySize === size
                              ? "bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-md shadow-terracotta-500/25 scale-[1.05]"
                              : "border-2 border-cream-200 bg-white text-brown-700 hover:border-terracotta-300 hover:bg-terracotta-50"
                          }`}
                        >
                          {size === 7 ? "7+" : size}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" value={selectedPartySize} {...register("partySize", { valueAsNumber: true })} />
                  </div>

                  {/* Table Selector */}
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-brown-800">
                      {t("selectTable")}
                    </label>
                    <InteractiveTableMap
                      selectedTable={selectedTable}
                      onSelectTable={(id) => {
                        setSelectedTable(id);
                        setValue("tableId", id);
                      }}
                      partySize={selectedPartySize}
                      location={selectedLocation}
                    />
                    <input type="hidden" value={selectedTable || ""} {...register("tableId")} />
                  </div>
                </div>
              </div>

              {/* Step 3: Occasion & Notes */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-cream-100 bg-gradient-to-r from-brown-800 to-brown-900 px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-500 text-sm font-bold text-white">3</div>
                  <h2 className="text-lg font-semibold text-white">{t("occasion") || "Occasion & Notes"}</h2>
                </div>
                <div className="space-y-6 p-6">
                  {/* Occasion chips */}
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-brown-800">
                      <Sparkles className="h-4 w-4 text-terracotta-500" />
                      {t("occasion")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((occ) => (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => {
                            const newVal = occ === selectedOccasion ? "" : occ;
                            setSelectedOccasion(newVal);
                            setValue("occasion", newVal as typeof occ || undefined);
                          }}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            selectedOccasion === occ
                              ? "bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-sm shadow-terracotta-500/25"
                              : "border border-cream-200 bg-white text-brown-600 hover:border-terracotta-300 hover:bg-terracotta-50 hover:text-terracotta-700"
                          }`}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special requests */}
                  <div>
                    <Textarea
                      label={t("specialRequests")}
                      placeholder={t("specialRequestsPlaceholder")}
                      className="rounded-xl border-cream-300 bg-cream-50/50 transition-all focus:border-terracotta-500 focus:bg-white focus:ring-2 focus:ring-terracotta-500/20"
                      rows={4}
                      {...register("specialRequests")}
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-8">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-3 rounded-xl bg-gradient-to-r from-terracotta-500 to-terracotta-600 py-4 text-base font-bold shadow-lg shadow-terracotta-500/25 transition-all duration-300 hover:from-terracotta-600 hover:to-terracotta-700 hover:shadow-xl hover:shadow-terracotta-500/30"
                  loading={loading}
                >
                  <CalendarDays className="h-5 w-5" />
                  {t("confirmReservation")}
                </Button>
              </div>
            </form>
          </div>

          {/* Right sidebar */}
          <aside className="w-full shrink-0 lg:w-80 lg:self-start lg:sticky lg:top-6 space-y-6">
            {/* Logged-in user card */}
            {isAuthenticated && session?.user && (
              <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 px-5 py-3">
                  <h3 className="text-sm font-semibold text-white">{t("reservingAs") || "Reserving As"}</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-terracotta-100 to-cream-100 text-lg font-bold text-terracotta-600">
                      {(session.user.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-brown-900">{session.user.name}</p>
                      <p className="text-xs text-brown-500">{session.user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {openingHours.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-cream-100 bg-cream-50 px-5 py-4">
                  <Clock className="h-4 w-4 text-terracotta-500" />
                  <h3 className="text-sm font-semibold text-brown-900">{t("openingHours")}</h3>
                </div>
                <div className="p-5">
                  <div className="space-y-2.5">
                    {openingHours.map((item) => (
                      <div key={item.day} className={`flex justify-between rounded-lg px-3 py-2 text-xs ${
                        item.closed ? "bg-error-50" : "bg-cream-50"
                      }`}>
                        <span className="font-semibold text-brown-700">{item.day}</span>
                        <span className={item.closed ? "font-medium text-error-500" : "text-brown-600"}>{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact info */}
            <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-cream-100 bg-cream-50 px-5 py-4">
                <h3 className="text-sm font-semibold text-brown-900">{t("contactUs")}</h3>
              </div>
              <div className="space-y-4 p-5">
                <a
                  href={`tel:${currentLocation?.phone || ""}`}
                  className="flex items-center gap-3 rounded-xl border border-cream-100 bg-cream-50/50 px-4 py-3 transition-all hover:border-terracotta-200 hover:bg-terracotta-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta-100 text-terracotta-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-brown-700">{currentLocation?.phone || "..."}</span>
                </a>
                <a
                  href={`mailto:${currentLocation?.email || ""}`}
                  className="flex items-center gap-3 rounded-xl border border-cream-100 bg-cream-50/50 px-4 py-3 transition-all hover:border-terracotta-200 hover:bg-terracotta-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta-100 text-terracotta-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-brown-700">{currentLocation?.email || "..."}</span>
                </a>
                <div className="flex items-center gap-3 rounded-xl border border-cream-100 bg-cream-50/50 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta-100 text-terracotta-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-brown-700">{currentLocation?.address || "..."}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
