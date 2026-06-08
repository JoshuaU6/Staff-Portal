import { useState, useEffect } from "react";

interface CityTime {
  city: string;
  country: string;
  timezone: string;
  flag: string;
}

const CITIES: CityTime[] = [
  { city: "Doha", country: "Qatar", timezone: "Asia/Qatar", flag: "🇶🇦" },
  { city: "London", country: "United Kingdom", timezone: "Europe/London", flag: "🇬🇧" },
  { city: "Paris", country: "France", timezone: "Europe/Paris", flag: "🇫🇷" },
  { city: "Washington DC", country: "USA", timezone: "America/New_York", flag: "🇺🇸" },
  { city: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", flag: "🇳🇬" },
  { city: "Hong Kong", country: "Hong Kong", timezone: "Asia/Hong_Kong", flag: "🇭🇰" },
];

function getTimeParts(timezone: string) {
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const dayDateStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(now);

  return { time: timeStr, dayDate: dayDateStr };
}

interface GlobalClockProps {
  compact?: boolean;
}

export function GlobalClock({ compact = false }: GlobalClockProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {CITIES.map((city) => {
          const { time, dayDate } = getTimeParts(city.timezone);
          return (
            <div key={city.city} className="flex items-center gap-2.5">
              <span className="text-base leading-none" aria-hidden="true">{city.flag}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 leading-none mb-0.5">{city.city}</p>
                <p className="text-sm font-mono font-semibold tabular-nums text-white leading-none">{time}</p>
                <p className="text-[10px] text-white/40 leading-none mt-0.5">{dayDate}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {CITIES.map((city) => {
        const { time, dayDate } = getTimeParts(city.timezone);
        return (
          <div
            key={city.city}
            className="bg-white/5 border border-white/10 p-5 text-center hover:border-mtc-gold/40 transition-colors"
          >
            <div className="text-2xl mb-2" aria-hidden="true">{city.flag}</div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">{city.city}</p>
            <p className="text-2xl md:text-3xl font-mono font-bold tabular-nums text-white leading-none mb-2">
              {time}
            </p>
            <p className="text-xs text-mtc-gold/80 uppercase tracking-wide">{dayDate}</p>
          </div>
        );
      })}
    </div>
  );
}
