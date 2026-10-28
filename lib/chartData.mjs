import { toNumber } from "./measurements.mjs";
import { CHART_COLORS } from "./theme.mjs";

const positiveNumber = (value) => {
  const number = toNumber(value);
  return number !== null && number > 0 ? number : null;
};
const pairedAverage = (left, right) => {
  const a = positiveNumber(left), b = positiveNumber(right);
  return a === null || b === null ? null : a / 2 + b / 2;
};

export const CHART_METRICS = [
  { id: "chest", name: "Chest", color: CHART_COLORS.chest, read: (m) => positiveNumber(m.chest) },
  { id: "biceps", name: "Biceps", color: CHART_COLORS.biceps, read: (m) => pairedAverage(m.leftBicep, m.rightBicep) },
  { id: "waist", name: "Waist", color: CHART_COLORS.waist, read: (m) => positiveNumber(m.waist) },
  { id: "thighs", name: "Thighs", color: CHART_COLORS.thighs, read: (m) => pairedAverage(m.leftThigh, m.rightThigh) },
  { id: "calves", name: "Calves", color: CHART_COLORS.calves, read: (m) => pairedAverage(m.leftCalf, m.rightCalf) },
];

function calendarTimestamp(value) {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return null;
    value = value.toISOString();
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return null;
  const day = value.slice(0, 10);
  const timestamp = Date.parse(`${day}T00:00:00.000Z`);
  return Number.isFinite(Date.parse(value)) && Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === day ? timestamp : null;
}

export function buildProgressChart(measurements) {
  const days = new Map();
  for (const measurement of measurements) {
    if (!measurement) continue;
    const x = calendarTimestamp(measurement.date);
    if (x === null) continue;
    const values = CHART_METRICS.map((metric) => metric.read(measurement));
    // Weight/height-only entries have nothing to plot on the circumference chart.
    if (values.every((value) => value === null)) continue;
    const day = days.get(x) || Array(CHART_METRICS.length).fill(null);
    // For duplicate dates use the last recorded value per metric, never a blank.
    values.forEach((value, index) => { if (value !== null) day[index] = value; });
    days.set(x, day);
  }

  const entries = [...days].sort(([a], [b]) => a - b);
  const series = CHART_METRICS.map(({ id, name, color }, index) => {
    let lastValue = null, sourceDate = null;
    return {
      id, name, color,
      // Carry forward only after the first real reading, in date order.
      data: entries.map(([x, values]) => {
        if (values[index] !== null) {
          lastValue = values[index];
          sourceDate = x;
        }
        return { x, y: lastValue, sourceDate, carried: lastValue !== null && sourceDate !== x };
      }),
    };
  }).filter((metric) => metric.data.some((point) => point.y !== null));
  if (series.length === 0) return { series, bounds: null };

  let min = Infinity, max = -Infinity;
  for (const metric of series) {
    for (const { y } of metric.data) {
      if (y !== null) { min = Math.min(min, y); max = Math.max(max, y); }
    }
  }
  const firstDate = entries[0][0], lastDate = entries.at(-1)[0];
  const datePadding = firstDate === lastDate ? 12 * 60 * 60 * 1000 : 0;
  const valuePadding = Math.max(1, (max - min) * 0.05);
  return {
    series,
    bounds: {
      xMin: firstDate - datePadding,
      xMax: lastDate + datePadding,
      yMin: Math.max(0, Math.floor((min - valuePadding) * 10) / 10),
      yMax: Math.ceil((max + valuePadding) * 10) / 10,
    },
  };
}
