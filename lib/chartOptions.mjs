export function createProgressChartOptions({ bounds, colors, fontFamily }) {
  const labelStyle = { colors: "rgba(255, 255, 255, 0.5)", fontFamily, fontSize: "10px" };
  const border = { show: true, color: "rgba(255, 255, 255, 0.08)" };
  const yaxis = {
    min: bounds.yMin, max: bounds.yMax, tickAmount: 5, forceNiceScale: false,
    title: { text: "Measurements (cm)", style: { color: "#9CA3AF", fontFamily, fontWeight: 500, fontSize: "11px" } },
    labels: { style: labelStyle, formatter: (value) => Number.isFinite(value) ? value.toFixed(1) : "-" },
  };
  return {
    chart: {
      type: "line", background: "transparent", foreColor: "#9CA3AF", fontFamily,
      toolbar: { show: false }, zoom: { enabled: false },
      // Sparse/duplicate-date updates should not morph existing points backwards.
      animations: { enabled: false },
    },
    colors,
    legend: { show: false },
    grid: { borderColor: border.color, padding: { left: 8, right: 12 }, xaxis: { lines: { show: true } } },
    xaxis: {
      type: "datetime", min: bounds.xMin, max: bounds.xMax,
      labels: { style: labelStyle, datetimeUTC: true, rotate: 0, hideOverlappingLabels: true },
      axisBorder: border, axisTicks: border,
    },
    yaxis,
    stroke: { curve: "straight", width: 2.5, lineCap: "round" },
    markers: { size: 4, strokeWidth: 0, hover: { sizeOffset: 2 } },
    tooltip: {
      theme: "dark", shared: true, intersect: false,
      x: { format: "dd MMM yyyy" },
      y: { formatter: (value) => Number.isFinite(value) ? `${value.toFixed(1)} cm` : "Not recorded" },
    },
    responsive: [{ breakpoint: 640, options: {
      chart: { height: 260 },
      // ApexCharts replaces this object at the breakpoint instead of merging it.
      yaxis: { ...yaxis, title: { ...yaxis.title, text: "" } },
      grid: { padding: { left: 0, right: 8 } },
      markers: { size: 3 },
    } }],
  };
}
