"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button, Skeleton } from "@/components/ui";
import { CalendarDays, Clock, MapPin, Users, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  location: string;
  occasion: string | null;
  status: string;
  specialRequests: string | null;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "Confirmed": return "confirmed" as const;
    case "Completed": case "Seated": return "delivered" as const;
    case "Cancelled": case "No-show": return "cancelled" as const;
    default: return "active" as const;
  }
}

export default function ReservationsPage() {
  const t = useTranslations("customer");
  const [upcoming, setUpcoming] = useState<Reservation[]>([]);
  const [past, setPast] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await fetch("/api/account/reservations");
        if (res.ok) {
          const data = await res.json();
          setUpcoming(data.upcoming || []);
          setPast(data.past || []);
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    fetchReservations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  function ReservationCard({ reservation, large = false }: { reservation: Reservation; large?: boolean }) {
    const date = new Date(reservation.date);
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const day = date.getDate();
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    return (
      <Card className="border border-cream-200">
        <CardContent className={large ? "p-5" : "p-4"}>
          <div className="flex items-center gap-4">
            <div className={`flex shrink-0 flex-col items-center justify-center rounded-lg ${
              large ? "h-20 w-20 bg-terracotta-500/10" : "h-14 w-14 bg-cream-200"
            }`}>
              <span className={`font-medium uppercase ${large ? "text-xs text-terracotta-500" : "text-[10px] text-brown-500"}`}>
                {month}
              </span>
              <span className={`font-bold ${large ? "text-3xl text-terracotta-500" : "text-xl text-brown-700"}`}>
                {day}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`font-medium text-brown-900 ${large ? "text-lg" : "text-sm"}`}>
                  {dayName}{large ? "" : `, ${reservation.time}`}
                </p>
                <Badge variant={getStatusVariant(reservation.status)}>
                  {reservation.status}
                </Badge>
              </div>
              <div className={`mt-1 ${large ? "space-y-1 text-sm" : "flex items-center gap-3 text-xs"} text-brown-600`}>
                {large && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-terracotta-500" />
                    {reservation.time}
                  </p>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className={large ? "h-4 w-4 text-terracotta-500" : "h-3.5 w-3.5"} />
                  {reservation.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className={large ? "h-4 w-4 text-terracotta-500" : "h-3.5 w-3.5"} />
                  {reservation.guests} guests
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">{t("reservations")}</h1>
        <Button size="sm" asChild>
          <Link href="/reservations">
            <Plus className="h-4 w-4" />
            {t("newReservation")}
          </Link>
        </Button>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-brown-900">{t("upcomingReservation")}</h2>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <ReservationCard reservation={r} large={i === 0} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center p-8 text-center">
              <CalendarDays className="mb-2 h-10 w-10 text-cream-400" />
              <p className="text-sm text-brown-500">{t("noReservations") || "No upcoming reservations"}</p>
              <Link href="/reservations" className="mt-2 text-xs font-medium text-terracotta-500 hover:text-terracotta-600">
                {t("makeReservation") || "Make a reservation"}
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-brown-900">Past Reservations</h2>
          <div className="space-y-3">
            {past.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <ReservationCard reservation={r} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
