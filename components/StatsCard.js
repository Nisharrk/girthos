import { formatMeasurement, toNumber } from "@/lib/measurements.mjs";

// components/StatsCard.js
export default function StatsCard({ title, value, previousValue, unit }) {
  const current = toNumber(value);
  const previous = toNumber(previousValue);
  const difference = current === null || previous === null ? 0 : current - previous;
  const change = Math.abs(difference) < 0.1 ? null : {
    value: Math.abs(difference).toFixed(1),
    isPositive: difference > 0,
    isNegative: difference < 0,
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 sm:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 min-w-0">
        <h3 className="mb-1.5 text-[11px] font-medium leading-tight tracking-wide text-gray-400 sm:mb-3 sm:text-sm">
          {title}
        </h3>
        <div className="space-y-1">
          <span className="font-display block truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {formatMeasurement(value, unit)}
          </span>
          {change && (
            <span className={`text-xs font-medium sm:text-sm ${change.isPositive ? 'text-green-400' : change.isNegative ? 'text-red-400' : 'text-gray-400'}`}>
              {change.isPositive ? '↑' : '↓'} {change.value} {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
