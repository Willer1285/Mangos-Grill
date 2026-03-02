"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface TableData {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
  x: number;
  y: number;
  shape: "round" | "square" | "rectangle";
}

// Restaurant floor plan data
const tables: TableData[] = [
  // Window section (top row)
  { id: "t1", number: 1, name: "Window 1", capacity: 2, status: "Available", x: 8, y: 8, shape: "round" },
  { id: "t2", number: 2, name: "Window 2", capacity: 2, status: "Occupied", x: 25, y: 8, shape: "round" },
  { id: "t3", number: 3, name: "Window 3", capacity: 4, status: "Available", x: 42, y: 8, shape: "square" },
  { id: "t4", number: 4, name: "Window 4", capacity: 4, status: "Reserved", x: 62, y: 8, shape: "square" },

  // Center section
  { id: "t5", number: 5, name: "Center 1", capacity: 6, status: "Available", x: 15, y: 35, shape: "rectangle" },
  { id: "t6", number: 6, name: "Center 2", capacity: 6, status: "Available", x: 45, y: 35, shape: "rectangle" },
  { id: "t7", number: 7, name: "Center 3", capacity: 4, status: "Occupied", x: 75, y: 35, shape: "square" },

  // Back section
  { id: "t8", number: 8, name: "Back 1", capacity: 2, status: "Available", x: 8, y: 62, shape: "round" },
  { id: "t9", number: 9, name: "Back 2", capacity: 8, status: "Available", x: 32, y: 62, shape: "rectangle" },
  { id: "t10", number: 10, name: "Back 3", capacity: 4, status: "Available", x: 62, y: 62, shape: "square" },

  // Patio section
  { id: "t11", number: 11, name: "Patio 1", capacity: 2, status: "Available", x: 82, y: 62, shape: "round" },
  { id: "t12", number: 12, name: "Patio 2", capacity: 4, status: "Available", x: 82, y: 8, shape: "round" },
];

const statusColors = {
  Available: { bg: "bg-success-500/15", border: "border-success-500", text: "text-success-600" },
  Occupied: { bg: "bg-error-500/10", border: "border-error-500/50", text: "text-error-500" },
  Reserved: { bg: "bg-warning-500/10", border: "border-warning-500/50", text: "text-warning-600" },
};

const shapeDimensions = {
  round: "w-14 h-14 rounded-full",
  square: "w-16 h-16 rounded-lg",
  rectangle: "w-24 h-14 rounded-lg",
};

interface InteractiveTableMapProps {
  selectedTable: string | null;
  onSelectTable: (id: string) => void;
  partySize: number;
}

export function InteractiveTableMap({
  selectedTable,
  onSelectTable,
  partySize,
}: InteractiveTableMapProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  function canSelect(table: TableData): boolean {
    return table.status === "Available" && table.capacity >= partySize;
  }

  return (
    <div className="space-y-3">
      {/* Floor plan */}
      <div className="relative overflow-hidden rounded-xl border border-cream-300 bg-cream-50 p-4">
        {/* Section labels */}
        <div className="absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wider text-brown-500">
          Window Side
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] font-medium uppercase tracking-wider text-brown-500">
          Patio
        </div>

        {/* Table grid */}
        <div className="relative mx-auto" style={{ height: 280 }}>
          {tables.map((table) => {
            const selectable = canSelect(table);
            const isSelected = selectedTable === table.id;
            const isHovered = hoveredTable === table.id;
            const colors = statusColors[table.status];

            return (
              <div
                key={table.id}
                className="absolute"
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                }}
              >
                <button
                  type="button"
                  disabled={!selectable}
                  onClick={() => selectable && onSelectTable(table.id)}
                  onMouseEnter={() => setHoveredTable(table.id)}
                  onMouseLeave={() => setHoveredTable(null)}
                  className={cn(
                    "relative flex flex-col items-center justify-center border-2 transition-all duration-200",
                    shapeDimensions[table.shape],
                    colors.bg,
                    colors.border,
                    selectable && "cursor-pointer hover:scale-110 hover:shadow-md",
                    !selectable && "cursor-not-allowed opacity-60",
                    isSelected &&
                      "scale-110 border-terracotta-500 bg-terracotta-500/20 shadow-lg ring-2 ring-terracotta-500/30"
                  )}
                  aria-label={`Table ${table.number}: ${table.name}, seats ${table.capacity}, ${table.status}`}
                >
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isSelected ? "text-terracotta-600" : colors.text
                    )}
                  >
                    {table.number}
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] text-brown-500">
                    <Users className="h-2.5 w-2.5" />
                    {table.capacity}
                  </span>
                </button>

                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-14 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-brown-900 px-3 py-1.5 text-xs text-white shadow-lg">
                    <p className="font-semibold">{table.name}</p>
                    <p>
                      Seats {table.capacity} &middot;{" "}
                      <span
                        className={cn(
                          table.status === "Available" && "text-success-500",
                          table.status === "Occupied" && "text-error-500",
                          table.status === "Reserved" && "text-warning-500"
                        )}
                      >
                        {table.status}
                      </span>
                    </p>
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-brown-900" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-brown-600">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-success-500 bg-success-500/15" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-error-500/50 bg-error-500/10" />
          Occupied
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-warning-500/50 bg-warning-500/10" />
          Reserved
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-terracotta-500 bg-terracotta-500/20" />
          Selected
        </div>
      </div>

      {/* Selected table info */}
      {selectedTable && (
        <div className="rounded-lg border border-terracotta-500/20 bg-terracotta-500/5 p-3">
          <p className="text-sm font-medium text-terracotta-600">
            {tables.find((t) => t.id === selectedTable)?.name} selected &mdash; Seats{" "}
            {tables.find((t) => t.id === selectedTable)?.capacity}
          </p>
        </div>
      )}
    </div>
  );
}
