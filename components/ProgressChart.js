"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { buildProgressChart } from "@/lib/chartData.mjs";
import { createProgressChartOptions } from "@/lib/chartOptions.mjs";
import { sans } from "@/app/fonts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ProgressChart({ measurements }) {
  const { series, bounds } = useMemo(() => buildProgressChart(measurements), [measurements]);
  const [hiddenMetrics, setHiddenMetrics] = useState(() => new Set());
  const visible = useMemo(() => series.filter((metric) => !hiddenMetrics.has(metric.id)), [series, hiddenMetrics]);
  const chartSeries = useMemo(() => visible.map(({ name, data }) => ({ name, data })), [visible]);
  const options = useMemo(() => bounds && createProgressChartOptions({
    bounds, colors: visible.map((metric) => metric.color), fontFamily: sans.style.fontFamily,
  }), [bounds, visible]);
  const allVisible = visible.length === series.length;

  const toggleMetric = (id) => setHiddenMetrics((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  return (
    <div>
      {series.length === 0 ? (
        <div role="status" className="flex min-h-[200px] items-center justify-center px-4 py-8 text-center text-sm leading-relaxed text-gray-400">
          {measurements.length === 0
            ? "No measurements yet. Add your first measurement to see the chart."
            : "No circumference measurements yet. Add chest, waist, or both sides of a paired measurement to see the chart."}
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Chart measurements" className="flex flex-wrap gap-2">
              {series.map(({ id, name, color }) => (
                <button key={id} type="button" aria-pressed={!hiddenMetrics.has(id)} onClick={() => toggleMetric(id)}
                  className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors hover:border-white/25 hover:bg-white/[0.04] ${hiddenMetrics.has(id) ? "border-white/5 text-gray-500" : "border-white/15 bg-white/[0.03] text-gray-200"}`}>
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {name}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setHiddenMetrics(allVisible ? new Set(series.map(({ id }) => id)) : new Set())}
              className="button-secondary text-xs">
              {allVisible ? "Hide All" : "Show All"}
            </button>
          </div>
          {visible.length === 0 ? (
            <div role="status" className="flex h-[260px] items-center justify-center text-sm text-gray-400 sm:h-[300px]">Select a measurement to show its progress.</div>
          ) : (
            <div className="chart-container">
              <Chart key={visible.map(({ id }) => id).join("-")} options={options} series={chartSeries} type="line" height={300} />
            </div>
          )}
          <p className="mt-4 text-center text-xs text-gray-500">Paired measurements use both sides.</p>
        </>
      )}
    </div>
  );
}
