import { localDate } from "./measurements.mjs";

// Prepared demo measurements; dates follow the visitor's local calendar.
// Return fresh records so editing the demo never changes the next session.
export function createGuestSamples(today = new Date()) {
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
    date.setDate(date.getDate() - (7 - index) * 7);
    const round = (value) => Math.round(value * 10) / 10;
    return {
      _id: `sample-${index}`,
      date: localDate(date),
      height: 178,
      weight: round(78 + index * 0.3),
      chest: round(98 + index * 0.5),
      leftBicep: round(33 + index * 0.2),
      rightBicep: round(33.5 + index * 0.2),
      waist: round(84 - index * 0.4),
      leftThigh: round(55 + index * 0.3),
      rightThigh: round(55.5 + index * 0.3),
      leftCalf: round(36 + index * 0.1),
      rightCalf: round(36.2 + index * 0.1),
    };
  });
}

export function saveGuestMeasurement(records, value, id) {
  const entry = { ...value, _id: id };
  const exists = records.some((record) => record._id === id);
  const next = exists ? records.map((record) => record._id === id ? entry : record) : [...records, entry];
  // Stable same-day ordering makes the last entered value win consistently.
  return next.sort((a, b) => a.date.localeCompare(b.date));
}
