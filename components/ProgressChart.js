// components/ProgressChart.js
"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { toNumber, average } from "@/lib/measurements.mjs";
import { sans } from "@/app/fonts";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CHART_FONT = sans.style.fontFamily;

const SERIES_NAMES = ["Chest", "Biceps", "Waist", "Thighs", "Calves"];

export default function ProgressChart({ measurements }) {
  const chartRef = useRef(null);
  const [visibleSeries, setVisibleSeries] = useState(
    new Set(SERIES_NAMES)
  );

  const allSeriesVisible = visibleSeries.size === SERIES_NAMES.length;

  const chartOptions = useMemo(() => ({
    chart: {
      type: "line",
      height: 300,
      toolbar: { show: false },
      foreColor: "#9CA3AF",
      background: "transparent",
      animations: {
        enabled: true,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 450,
        },
      },
      events: {
        mounted: function (chartContext) {
          chartRef.current = chartContext;
        },
        updated: function (chartContext) {
          chartRef.current = chartContext;
        },
        legendClick: function (chartContext, seriesIndex, config) {
          const seriesName = SERIES_NAMES[seriesIndex];
          const newVisibleSeries = new Set(visibleSeries);

          if (newVisibleSeries.has(seriesName)) {
            newVisibleSeries.delete(seriesName);
            chartRef.current.hideSeries(seriesName);
          } else {
            newVisibleSeries.add(seriesName);
            chartRef.current.showSeries(seriesName);
          }

          setVisibleSeries(newVisibleSeries);
        },
      },
    },
    grid: {
      show: true,
      borderColor: "rgba(255, 255, 255, 0.08)",
      strokeDashArray: 0,
      position: "back",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: true,
        style: {
          colors: "rgba(255, 255, 255, 0.5)",
          fontFamily: CHART_FONT,
          fontSize: "10px",
        },
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
        },
        rotate: 0,
        offsetY: 0,
      },
      axisBorder: {
        show: true,
        color: "rgba(255, 255, 255, 0.08)",
      },
      axisTicks: {
        show: true,
        color: "rgba(255, 255, 255, 0.08)",
      },
      crosshairs: {
        show: true,
        stroke: {
          color: "rgba(255, 255, 255, 0.2)",
          width: 1,
          dashArray: 0,
        },
      },
    },
    yaxis: {
      show: true,
      title: {
        text: "Measurements (cm)",
        style: {
          color: "rgba(255, 255, 255, 0.5)",
          fontFamily: CHART_FONT,
          fontSize: "11px",
          fontWeight: 500,
        },
      },
      labels: {
        show: true,
        style: {
          colors: "rgba(255, 255, 255, 0.5)",
          fontFamily: CHART_FONT,
          fontSize: "10px",
        },
        formatter: (value) =>
          Number.isFinite(value) ? value.toFixed(1) : "-",
      },
      axisBorder: {
        show: true,
        color: "rgba(255, 255, 255, 0.08)",
      },
      axisTicks: {
        show: true,
        color: "rgba(255, 255, 255, 0.08)",
      },
      floating: false,
      min: (min) => Math.floor(min - 1),
      max: (max) => Math.ceil(max + 1),
      tickAmount: 5,
      forceNiceScale: true,
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      x: {
        format: "dd MMM yyyy",
      },
      style: {
        fontSize: "11px",
        fontFamily: CHART_FONT,
      },
      shared: true,
      intersect: false,
      y: {
        formatter: (value) =>
          Number.isFinite(value) ? `${value.toFixed(1)} cm` : "-",
      },
      marker: {
        show: true,
      },
      fixed: {
        enabled: false,
        position: "topRight",
        offsetX: 0,
        offsetY: 0,
      },
    },
    colors: ["#30D158", "#0A84FF", "#BF5AF2", "#FF9F0A", "#FF453A"],
    stroke: {
      curve: "smooth",
      width: 2.5,
      lineCap: "round",
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: "rgba(255, 255, 255, 0.5)",
        useSeriesColors: false,
      },
      fontFamily: CHART_FONT,
      fontSize: "11px",
      itemMargin: {
        horizontal: 12,
        vertical: 8,
      },
      onItemClick: {
        toggleDataSeries: false,
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 6,
        sizeOffset: 2,
      },
    },
    theme: {
      mode: "dark",
      palette: "palette1",
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 260,
            background: "transparent",
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            offsetY: 4,
            itemMargin: {
              horizontal: 8,
              vertical: 6,
            },
          },
          yaxis: {
            title: {
              text: "",
            },
            labels: {
              offsetX: -8,
            },
          },
          markers: {
            size: 3,
            hover: {
              size: 5,
              sizeOffset: 2,
            },
          },
          grid: {
            padding: {
              right: 6,
              left: 6,
            },
          },
        },
      },
    ],
  }), [visibleSeries]);

  const chartSeries = useMemo(() => [
    {
      name: "Chest",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: toNumber(m.chest),
      })),
    },
    {
      name: "Biceps",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: average(m.leftBicep, m.rightBicep),
      })),
    },
    {
      name: "Waist",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: toNumber(m.waist),
      })),
    },
    {
      name: "Thighs",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: average(m.leftThigh, m.rightThigh),
      })),
    },
    {
      name: "Calves",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: average(m.leftCalf, m.rightCalf),
      })),
    },
  ], [measurements]);

  const handleToggleAll = () => {
    if (!chartRef.current) return;

    if (allSeriesVisible) {
      SERIES_NAMES.forEach((name) => {
        chartRef.current.hideSeries(name);
      });
      setVisibleSeries(new Set());
    } else {
      SERIES_NAMES.forEach((name) => {
        chartRef.current.showSeries(name);
      });
      setVisibleSeries(new Set(SERIES_NAMES));
    }
  };

  // Reset visibility state when measurements change
  useEffect(() => {
    if (chartRef.current) {
      SERIES_NAMES.forEach((name) => {
        chartRef.current.showSeries(name);
      });
      setVisibleSeries(new Set(SERIES_NAMES));
    }
  }, [measurements]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl sm:p-6">
      <div className="mb-3 flex justify-end sm:mb-6">
        <button
          onClick={handleToggleAll}
          disabled={measurements.length === 0}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium tracking-wide text-white/90 transition-colors duration-200 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
        >
          {allSeriesVisible ? "Hide All" : "Show All"}
        </button>
      </div>

      {measurements.length > 0 ? (
        <div className="relative">
          <div className="chart-container">
            <Chart options={chartOptions} series={chartSeries} type="line" />
          </div>
          <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400 text-center font-light">
            Tap on the chart to see detailed measurements
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No measurements yet. Add your first measurement to see the chart.
        </div>
      )}
    </div>
  );
}
