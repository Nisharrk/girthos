import { formatMeasurement, toNumber } from "@/lib/measurements.mjs";

// components/StatsCard.js
export default function StatsCard({ title, value, previousValue, unit }) {
  const current = toNumber(value);
  const previous = toNumber(previousValue);
  const difference = current === null || previous === null ? 0 : current - previous;
  const change = Math.abs(difference) < 0.1 ? null : {
    value: Math.abs(difference).toFixed(1),
    isPositive: difference > 0,
  };

  return (
    <div className="surface-panel p-4 sm:p-6">
      <div className="min-w-0">
        <h3 className="mb-1.5 text-[11px] font-medium leading-tight tracking-wide text-gray-400 sm:mb-3 sm:text-sm">
          {title}
        </h3>
        <div className="space-y-1">
          <span className="font-display block truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {formatMeasurement(value, unit)}
          </span>
          {change && (
            <span className="text-xs font-medium text-gray-400 sm:text-sm">
              {change.isPositive ? '↑' : '↓'} {change.value} {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
