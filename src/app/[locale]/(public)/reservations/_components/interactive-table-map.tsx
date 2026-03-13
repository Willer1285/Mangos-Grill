"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Users, Loader2 } from "lucide-react";

interface TableData {
  _id: string;
  number: number;
  name: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
  location: string;
  shape: "round" | "square" | "rectangle";
}

const statusColors = {
  Available: { bg: "bg-success-500/10", border: "border-success-500/40", text: "text-success-600", dot: "bg-success-500" },
  Occupied: { bg: "bg-error-500/10", border: "border-error-500/40", text: "text-error-500", dot: "bg-error-500" },
  Reserved: { bg: "bg-warning-500/10", border: "border-warning-500/40", text: "text-warning-600", dot: "bg-warning-500" },
};

interface InteractiveTableMapProps {
  selectedTable: string | null;
  onSelectTable: (id: string) => void;
  partySize: number;
  location?: string;
}

export function InteractiveTableMap({
  selectedTable,
  onSelectTable,
  partySize,
  location,
}: InteractiveTableMapProps) {
  const t = useTranslations("reservations");
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) {
      setTables([]);
      setLoading(false);
      return;
    }
    async function fetchTables() {
      setLoading(true);
      try {
        const res = await fetch("/api/tables");
        if (res.ok) {
          const data = await res.json();
          setTables(data);
        }
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    }
    fetchTables();
  }, [location]);

  const filtered = location
    ? tables.filter((t) => t.location === location)
    : [];

  function canSelect(table: TableData): boolean {
    return table.status === "Available" && table.capacity >= partySize;
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-cream-300 bg-cream-50">
        <Loader2 className="h-5 w-5 animate-spin text-brown-400" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-cream-300 bg-cream-50">
        <p className="text-sm text-brown-500">{t("selectLocationFirst")}</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-cream-300 bg-cream-50">
        <p className="text-sm text-brown-500">{t("noTablesAvailable")}</p>
      </div>
    );
  }

  const selectedInfo = filtered.find((t) => t._id === selectedTable);

  return (
    <div className="space-y-3">
      {/* Table grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((table) => {
          const selectable = canSelect(table);
          const isSelected = selectedTable === table._id;
          const colors = statusColors[table.status];

          return (
            <button
              key={table._id}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onSelectTable(table._id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all duration-200",
                colors.bg,
                colors.border,
                selectable && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
                !selectable && "cursor-not-allowed opacity-50",
                isSelected && "border-terracotta-500 bg-terracotta-500/15 ring-2 ring-terracotta-500/30 shadow-md"
              )}
            >
              <span className={cn("text-lg font-bold", isSelected ? "text-terracotta-600" : colors.text)}>
                #{table.number}
              </span>
              <span className="text-xs font-medium text-brown-700">{table.name}</span>
              <span className="flex items-center gap-1 text-xs text-brown-500">
                <Users className="h-3 w-3" />
                {table.capacity} {t("seats")}
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                <span className={colors.text}>{table.status}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-brown-600">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
          {t("available")}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-error-500" />
          {t("occupied")}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning-500" />
          {t("reserved")}
        </div>
      </div>

      {/* Selected table info */}
      {selectedInfo && (
        <div className="rounded-lg border border-terracotta-500/20 bg-terracotta-500/5 p-3">
          <p className="text-sm font-medium text-terracotta-600">
            {selectedInfo.name} ({t("table")} #{selectedInfo.number}) &mdash; {selectedInfo.capacity} {t("seats")}
          </p>
        </div>
      )}
    </div>
  );
}
