export const NUMERIC_FIELDS = [
  "height", "weight", "chest", "leftBicep", "rightBicep", "waist",
  "leftThigh", "rightThigh", "leftCalf", "rightCalf",
];

export function toNumber(value) {
  if (value == null || typeof value === "boolean") return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function average(left, right) {
  const a = toNumber(left), b = toNumber(right);
  return a === null || b === null ? null : (a + b) / 2;
}
export const getAverageBiceps = (m) => average(m?.leftBicep, m?.rightBicep);
export const getAverageThighs = (m) => average(m?.leftThigh, m?.rightThigh);
export const getAverageCalves = (m) => average(m?.leftCalf, m?.rightCalf);

// Records arrive chronologically. Missing fields do not erase earlier readings.
export function getMetricTrend(measurements, read) {
  const result = { value: null, previousValue: null };
  for (let index = measurements.length - 1; index >= 0; index--) {
    const value = toNumber(read(measurements[index]));
    if (value === null || value <= 0) continue;
    if (result.value === null) result.value = value;
    else { result.previousValue = value; break; }
  }
  return result;
}

export function formatMeasurement(value, unit = "cm") {
  const number = toNumber(value);
  return number === null ? "-" : `${number.toFixed(1)} ${unit}`;
}
export const formatCm = (value) => formatMeasurement(value);
export const formatHeight = formatCm;
export const formatWeight = (value) => formatMeasurement(value, "kg");

// Calendar dates for inputs must use local time, not UTC.
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validateMeasurement(input, today = localDate()) {
  const errors = {}, value = {};
  const date = typeof input?.date === "string" ? input.date : "";
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    errors.date = "Enter a valid date";
  } else if (date > today) {
    errors.date = "Must be today or earlier";
  }
  value.date = date;
  for (const field of NUMERIC_FIELDS) {
    const raw = input?.[field];
    const missing = raw == null || raw === "";
    const number = toNumber(raw);
    value[field] = number;
    if (missing) {
      continue;
    } else if (number === null || number <= 0) {
      errors[field] = "Must be a positive number";
    } else if (field === "height" && (number < 50 || number > 300)) {
      errors[field] = "50-300 cm";
    } else if (field === "weight" && (number < 20 || number > 300)) {
      errors[field] = "20-300 kg";
    }
  }
  if (NUMERIC_FIELDS.every((field) => value[field] === null) && !Object.keys(errors).some((field) => NUMERIC_FIELDS.includes(field))) {
    errors.weight = "Enter at least one measurement";
  }
  return { value, errors };
}

export function formatDate(value) {
  if (value == null || value === "") return "-";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(undefined, { timeZone: "UTC" })
    : "-";
}
