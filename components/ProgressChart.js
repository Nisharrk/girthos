// components/ProgressChart.js
"use client";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ProgressChart({ measurements }) {
  const chartRef = useRef(null);
  const [allSeriesVisible, setAllSeriesVisible] = useState(true);
  const [visibleSeries, setVisibleSeries] = useState(new Set(["Chest", "Biceps", "Waist", "Thighs", "Calves"]));
  const seriesNames = ["Chest", "Biceps", "Waist", "Thighs", "Calves"];

  const chartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      foreColor: "#9CA3AF",
      background: "transparent",
      animations: {
        enabled: true,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 450
        }
      },
      events: {
        mounted: function(chartContext) {
          chartRef.current = chartContext;
        },
        updated: function(chartContext) {
          chartRef.current = chartContext;
        },
        legendClick: function(chartContext, seriesIndex, config) {
          const seriesName = seriesNames[seriesIndex];
          const newVisibleSeries = new Set(visibleSeries);
          
          if (newVisibleSeries.has(seriesName)) {
            newVisibleSeries.delete(seriesName);
            chartRef.current.hideSeries(seriesName);
          } else {
            newVisibleSeries.add(seriesName);
            chartRef.current.showSeries(seriesName);
          }
          
          setVisibleSeries(newVisibleSeries);
          setAllSeriesVisible(newVisibleSeries.size === seriesNames.length);
        }
      }
    },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.08)",
      strokeDashArray: 0,
      opacity: 0.2,
    },
    xaxis: {
      type: "datetime",
      labels: { 
        style: { 
          colors: "rgba(255, 255, 255, 0.5)",
          fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
          fontSize: '12px',
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
        }
      },
      axisBorder: {
        color: "rgba(255, 255, 255, 0.08)"
      },
      axisTicks: {
        color: "rgba(255, 255, 255, 0.08)"
      },
    },
    yaxis: {
      title: { 
        text: "Measurements (cm)",
        style: { 
          color: "rgba(255, 255, 255, 0.5)",
          fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
          fontSize: "13px",
          fontWeight: 500
        }
      },
      labels: { 
        style: { 
          colors: "rgba(255, 255, 255, 0.5)",
          fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
          fontSize: '12px',
        },
        formatter: (value) => value.toFixed(1)
      },
      axisBorder: {
        color: "rgba(255, 255, 255, 0.08)"
      },
      axisTicks: {
        color: "rgba(255, 255, 255, 0.08)"
      },
      floating: false,
      min: (min) => Math.floor(min - 1),
      max: (max) => Math.ceil(max + 1),
      tickAmount: 8,
      forceNiceScale: true,
    },
    tooltip: {
      theme: "dark",
      x: {
        format: 'dd MMM yyyy'
      },
      style: {
        fontSize: '12px',
        fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
      },
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => value ? `${value.toFixed(1)} cm` : '-'
      }
    },
    colors: ["#30D158", "#0A84FF", "#BF5AF2", "#FF9F0A", "#FF453A", "#FF375F"],
    stroke: { 
      curve: "smooth",
      width: 2.5,
      lineCap: 'round',
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: "rgba(255, 255, 255, 0.5)",
        useSeriesColors: false
      },
      fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
      fontSize: '13px',
      itemMargin: { 
        horizontal: 16
      },
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      }
    },
    markers: {
      size: 5,
      strokeWidth: 0,
      hover: {
        size: 7,
        sizeOffset: 3
      }
    },
  };

  const chartSeries = [
    {
      name: "Chest",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: m.chest,
      })),
    },
    {
      name: "Biceps",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: (Number(m.leftBicep) + Number(m.rightBicep)) / 2,
      })),
    },
    {
      name: "Waist",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: m.waist,
      })),
    },
    {
      name: "Thighs",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: (Number(m.leftThigh) + Number(m.rightThigh)) / 2,
      })),
    },
    {
      name: "Calves",
      data: measurements.map((m) => ({
        x: new Date(m.date),
        y: (Number(m.leftCalf) + Number(m.rightCalf)) / 2,
      })),
    },
  ];

  const handleToggleAll = () => {
    if (!chartRef.current) return;

    if (allSeriesVisible) {
      seriesNames.forEach((name) => {
        chartRef.current.hideSeries(name);
      });
      setVisibleSeries(new Set());
    } else {
      seriesNames.forEach((name) => {
        chartRef.current.showSeries(name);
      });
      setVisibleSeries(new Set(seriesNames));
    }
    setAllSeriesVisible(!allSeriesVisible);
  };

  // Reset visibility state when measurements change
  useEffect(() => {
    if (chartRef.current) {
      seriesNames.forEach((name) => {
        chartRef.current.showSeries(name);
      });
      setVisibleSeries(new Set(seriesNames));
      setAllSeriesVisible(true);
    }
  }, [measurements]);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex justify-end mb-6">
        <button
          onClick={handleToggleAll}
          disabled={measurements.length === 0}
          className="px-4 py-2 text-sm text-white/90 rounded-full bg-white/10 hover:bg-white/20 
                   transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                   font-medium tracking-wide"
        >
          {allSeriesVisible ? "Hide All" : "Show All"}
        </button>
      </div>

      {measurements.length > 0 ? (
        <div className="relative">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={400}
          />
          <div className="mt-6 text-sm text-gray-400 text-center font-light">
            *Bilateral measurements show average of left/right sides
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8 font-light">
          No measurements recorded yet
        </p>
      )}
    </div>
  );
}
