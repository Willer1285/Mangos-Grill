"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { CalendarDays, Clock, MapPin, Users, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";

/* ── Types ───────────────────────────────────────────────── */
type ReservationStatus = "confirmed" | "completed" | "cancelled";

interface Reservation {
  id: number;
  month: string;
  day: number;
  dayName: string;
  time: string;
  location: string;
  guests: number;
  status: ReservationStatus;
}

/* ── Mock data ───────────────────────────────────────────── */
const upcomingReservation: Reservation = {
  id: 1,
  month: "MAR",
  day: 5,
  dayName: "Thursday",
  time: "7:30 PM",
  location: "Houston - Montrose",
  guests: 4,
  status: "confirmed",
};

const pastReservations: Reservation[] = [
  {
    id: 2,
    month: "FEB",
    day: 20,
    dayName: "Thursday",
    time: "6:00 PM",
    location: "Houston - Heights",
    guests: 2,
    status: "completed",
  },
  {
    id: 3,
    month: "FEB",
    day: 10,
    dayName: "Monday",
    time: "8:00 PM",
    location: "Houston - Montrose",
    guests: 6,
    status: "completed",
  },
  {
    id: 4,
    month: "JAN",
    day: 25,
    dayName: "Saturday",
    time: "7:00 PM",
    location: "Houston - Katy",
    guests: 3,
    status: "cancelled",
  },
];

export default function ReservationsPage() {
  const t = useTranslations("customer");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">
          {t("reservations")}
        </h1>
        <Button size="sm" asChild>
          <Link href="/reservations">
            <Plus className="h-4 w-4" />
            {t("newReservation")}
          </Link>
        </Button>
      </div>

      {/* ── Upcoming Reservation ────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-brown-900">
          {t("upcomingReservation")}
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border border-cream-200">
            <CardContent className="p-5">
              <div className="flex gap-4">
                {/* Large date box */}
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-terracotta-500/10">
                  <span className="text-xs font-medium uppercase text-terracotta-500">
                    {upcomingReservation.month}
                  </span>
                  <span className="text-3xl font-bold text-terracotta-500">
                    {upcomingReservation.day}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-medium text-brown-900">
                      {upcomingReservation.dayName}
                    </p>
                    <Badge variant="confirmed">
                      {upcomingReservation.status.charAt(0).toUpperCase() +
                        upcomingReservation.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-brown-600">
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-terracotta-500" />
                      {upcomingReservation.time}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-terracotta-500" />
                      {upcomingReservation.location}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-terracotta-500" />
                      {upcomingReservation.guests} guests
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm">
                      {t("modify")}
                    </Button>
                    <Button variant="destructive" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Past Reservations ───────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-brown-900">
          Past Reservations
        </h2>

        <div className="space-y-3">
          {pastReservations.map((reservation, i) => (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <Card className="border border-cream-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Date box */}
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-cream-200">
                      <span className="text-[10px] font-medium uppercase text-brown-500">
                        {reservation.month}
                      </span>
                      <span className="text-xl font-bold text-brown-700">
                        {reservation.day}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-brown-900">
                          {reservation.dayName}, {reservation.time}
                        </p>
                        <Badge variant={reservation.status}>
                          {reservation.status.charAt(0).toUpperCase() +
                            reservation.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-brown-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {reservation.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {reservation.guests} guests
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
