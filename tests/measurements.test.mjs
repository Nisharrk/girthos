import assert from "node:assert/strict";
import test from "node:test";
import { validateMeasurement, toNumber, average, formatMeasurement, localDate, getMetricTrend, getAverageBiceps, formatDate } from "../lib/measurements.mjs";

const valid = { date: "2026-10-27", height: "180", weight: "80.5" };
const validate = (input) => validateMeasurement(input, "2026-10-27");

test("valid inputs normalize numbers and clear empty optional values", () => {
  const { value, errors } = validate({ ...valid, chest: "" });
  assert.deepEqual(errors, {});
  assert.equal(value.weight, 80.5);
  assert.equal(value.height, 180);
  assert.equal(value.chest, null);
  assert.equal(value.leftBicep, null);
});

test("biceps-only entries do not require weight or height or fabricate missing measurements", () => {
  const { value, errors } = validate({ date: valid.date, leftBicep: "34", rightBicep: "35" });
  assert.deepEqual(errors, {});
  assert.equal(value.leftBicep, 34);
  for (const field of ["weight", "height", "chest", "waist"]) assert.equal(value[field], null);
  assert.ok(validate({ date: valid.date }).errors.weight);
});

test("rejects invalid and future calendar dates, including normalized February dates", () => {
  for (const date of ["", "invalid", "2026-02-30", "2026-10-28", "2026-1-01"]) {
    assert.ok(validate({ ...valid, date }).errors.date, date);
  }
  assert.equal(validate({ ...valid, date: "2024-02-29" }).errors.date, undefined);
});

test("rejects malformed, missing, non-finite, and out-of-range measurements", () => {
  for (const input of [null, {}, { ...valid, height: 49 }, { ...valid, weight: 301 }, { ...valid, weight: " " }, { ...valid, chest: -1 }, { ...valid, chest: 0 }, { ...valid, chest: Infinity }, { ...valid, chest: true }, { ...valid, chest: [] }, { ...valid, weight: "NaN" }]) {
    assert.ok(Object.keys(validate(input).errors).length, JSON.stringify(input));
  }
});

test("preserves numeric zero in formatting and averages without turning missing values into zero", () => {
  assert.equal(toNumber(0), 0);
  assert.equal(toNumber(""), null);
  assert.equal(toNumber(null), null);
  assert.equal(average(0, 2), 1);
  assert.equal(average(null, 2), null);
  assert.equal(formatMeasurement("80.5", "kg"), "80.5 kg");
  assert.equal(formatMeasurement(undefined), "-");
});

test("date defaults use local calendar components", () => {
  assert.equal(localDate(new Date(2026, 9, 27, 23, 59)), "2026-10-27");
});

test("latest metric cards retain the last two recorded values across partial entries", () => {
  const records = [{ chest: 100 }, { chest: null }, { chest: "102" }, { weight: 80 }];
  assert.deepEqual(getMetricTrend(records, (m) => m.chest), { value: 102, previousValue: 100 });
  assert.deepEqual(getMetricTrend(records, getAverageBiceps), { value: null, previousValue: null });
  assert.deepEqual(getMetricTrend([{ leftBicep: 32, rightBicep: 34 }, { leftBicep: 35 }], getAverageBiceps), { value: 33, previousValue: null });
});

test("missing and invalid history dates do not display the Unix epoch", () => {
  for (const value of [undefined, null, "", "bad"]) assert.equal(formatDate(value), "-");
});
