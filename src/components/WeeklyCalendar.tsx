"use client";

import { format, addDays, isSameDay } from "date-fns";
import { Check } from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";

interface WeeklyCalendarProps {
  startDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  completedLogs: Record<string, any>; // From Zustand store
}

export function WeeklyCalendar({
  startDate,
  selectedDate,
  onSelectDate,
  completedLogs,
}: WeeklyCalendarProps) {
  const { t } = useTranslation();
  // Generate 7 days starting from startDate
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  return (
    <div className="flex justify-between items-center mb-6 overflow-x-auto pb-4 gap-2 scrollbar-none">
      {weekDays.map((day, i) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const isSelected = isSameDay(day, selectedDate);
        const isCompleted = !!completedLogs[dateStr];
        const isToday = isSameDay(day, new Date());

        return (
          <button
            key={i}
            onClick={() => onSelectDate(day)}
            className={`flex flex-col items-center justify-center p-3 min-w-[3.5rem] transition-all border-none
              ${isSelected 
                ? "bg-primary text-on-primary scale-110 shadow-[0_10px_20px_rgba(255,222,0,0.3)] font-display rounded-lg" 
                : "bg-surface-container text-on-surface/60 hover:bg-surface-container-high rounded-lg"
              }
              ${isToday && !isSelected ? "ring-2 ring-primary/50" : ""}
            `}
          >
            <span className="text-[9px] font-bold mb-1 tracking-widest uppercase">
              {t(`weekdays.${dayKeys[day.getDay()]}`)}
            </span>
            {isCompleted ? (
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isSelected ? "bg-black/20" : "bg-[#00E475]/20 text-[#00E475]"}`}>
                <Check className="w-5 h-5" />
              </div>
            ) : (
              <span className={`text-lg font-black ${isSelected ? "text-on-primary" : "text-on-surface"}`}>
                {format(day, "d")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
