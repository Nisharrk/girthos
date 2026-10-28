import assert from "node:assert/strict";
import test from "node:test";
import { buildProgressChart } from "../lib/chartData.mjs";
import { createProgressChartOptions } from "../lib/chartOptions.mjs";
import { CHART_COLORS } from "../lib/theme.mjs";

const record = (date, values = {}) => ({ date, height: 180, weight: 80, ...values });
const values = (chart, id) => chart.series.find((series) => series.id === id)?.data.map((point) => point.y);

test("weight-only records cannot move or truncate circumference lines, including duplicate dates", () => {
  const recorded = [record("2026-10-01", { chest: 100 }), record("2026-10-08", { chest: 102 })];
  const baseline = buildProgressChart(recorded);
  for (const date of ["2026-09-01", "2026-10-04", "2026-10-08", "2026-10-27"]) {
    assert.deepEqual(buildProgressChart([...recorded, record(date)]), baseline);
  }
});

test("empty, weight-only, or incomplete-pair datasets return a safe empty chart", () => {
  for (const records of [[], [record("2026-10-01")], [record("2026-10-01", { leftBicep: 34, rightCalf: 37 })]]) {
    assert.deepEqual(buildProgressChart(records), { series: [], bounds: null });
  }
});

test("sparse series share dates and preserve gaps without inventing zeroes or single-sided averages", () => {
  const chart = buildProgressChart([
    record("2026-10-01", { chest: 100, leftBicep: 32, rightBicep: 34 }),
    record("2026-10-08", { waist: 80, leftBicep: 33 }),
    record("2026-10-15", { chest: 102, leftBicep: 34, rightBicep: 36 }),
  ]);
  assert.deepEqual(values(chart, "chest"), [100, null, 102]);
  assert.deepEqual(values(chart, "waist"), [null, 80, null]);
  assert.deepEqual(values(chart, "biceps"), [33, null, 35]);
  assert.deepEqual(chart.series[0].data.map((point) => point.x), chart.series[1].data.map((point) => point.x));
  assert.deepEqual(chart.series.map((series) => series.id), ["chest", "biceps", "waist"]);
});

test("same-day chart values merge without losing measurements from earlier entries", () => {
  const records = [
    record("2026-10-01", { chest: 100, waist: 80 }),
    record("2026-10-01T00:00:00.000Z", { chest: 101 }),
    record("2026-10-01", { waist: 79, chest: null }),
  ];
  const original = structuredClone(records);
  const chart = buildProgressChart(records);
  assert.deepEqual(values(chart, "chest"), [101]);
  assert.deepEqual(values(chart, "waist"), [79]);
  assert.deepEqual(records, original);
});

test("backdated and same-day records have chronological UTC coordinates with padding for a single day", () => {
  const chart = buildProgressChart([
    record("2026-10-27", { chest: 101 }),
    record(new Date("2026-10-01T00:00:00.000Z"), { chest: 100 }),
  ]);
  assert.deepEqual(values(chart, "chest"), [100, 101]);
  const single = buildProgressChart([record("2026-10-01", { chest: 100 })]);
  const x = single.series[0].data[0].x;
  assert.ok(single.bounds.xMin < x && single.bounds.xMax > x);
  assert.ok(single.bounds.yMin < 100 && single.bounds.yMax > 100);
});

test("invalid dates and malformed optional values never reach the chart renderer", () => {
  const chart = buildProgressChart([
    null,
    ...[null, "", "bad", "2026-02-30", true, new Date(NaN)].map((date) => record(date, { chest: 100 })),
    record("2026-10-01", { chest: "100.5", waist: "", leftCalf: true, rightCalf: 37 }),
    ...[0, -1, Infinity, NaN, {}, [], "bad"].map((chest) => record("2026-10-02", { chest })),
  ]);
  assert.deepEqual(values(chart, "chest"), [100.5]);
  assert.equal(chart.series.length, 1);
  assert.ok(Object.values(chart.bounds).every(Number.isFinite));
});

test("constant values keep a nonzero vertical range and removing the last reading returns an empty chart", () => {
  const records = [record("2026-10-01", { waist: 80 }), record("2026-10-08", { waist: 80 })];
  const chart = buildProgressChart(records);
  assert.ok(chart.bounds.yMin < 80 && chart.bounds.yMax > 80);
  assert.equal(buildProgressChart(records.map((entry) => ({ ...entry, waist: null }))).bounds, null);
});

test("series colors stay attached to metrics and chart bounds do not depend on visibility", () => {
  const chart = buildProgressChart([record("2026-10-01", { chest: 100, waist: 80 })]);
  const options = (series) => createProgressChartOptions({ bounds: chart.bounds, colors: series.map((entry) => entry.color), fontFamily: "sans-serif" });
  const all = options(chart.series), waistOnly = options(chart.series.filter((entry) => entry.id === "waist"));
  assert.deepEqual(waistOnly.colors, [CHART_COLORS.waist]);
  assert.equal(all.xaxis.min, waistOnly.xaxis.min);
  assert.equal(all.yaxis.min, waistOnly.yaxis.min);
  assert.equal(all.yaxis.max, waistOnly.yaxis.max);
  assert.equal(all.tooltip.y.formatter(null), "Not recorded");
  const mobileAxis = all.responsive[0].options.yaxis;
  assert.equal(mobileAxis.min, all.yaxis.min);
  assert.equal(mobileAxis.max, all.yaxis.max);
  assert.equal(mobileAxis.labels.formatter(80), "80.0");
});
