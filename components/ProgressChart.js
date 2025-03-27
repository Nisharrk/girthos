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
      show: true,
      borderColor: "rgba(255, 255, 255, 0.08)",
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20
      }
    },
    xaxis: {
      type: "datetime",
      labels: { 
        show: true,
        style: { 
          colors: "rgba(255, 255, 255, 0.5)",
          fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
          fontSize: '10px',
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
        },
        rotate: 0,
        offsetY: 0
      },
      axisBorder: {
        show: true,
        color: "rgba(255, 255, 255, 0.08)"
      },
      axisTicks: {
        show: true,
        color: "rgba(255, 255, 255, 0.08)"
      },
      crosshairs: {
        show: true,
        stroke: {
          color: "rgba(255, 255, 255, 0.2)",
          width: 1,
          dashArray: 0
        }
      }
    },
    yaxis: {
      show: true,
      title: { 
        text: "Measurements (cm)",
        style: { 
          color: "rgba(255, 255, 255, 0.5)",
          fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
          fontSize: "11px",
          fontWeight: 500
        }
      },
      labels: { 
        show: true,
        style: { 
          colors: "rgba(255, 255, 255, 0.5)",
          fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
          fontSize: '10px',
        },
        formatter: (value) => value.toFixed(1)
      },
      axisBorder: {
        show: true,
        color: "rgba(255, 255, 255, 0.08)"
      },
      axisTicks: {
        show: true,
        color: "rgba(255, 255, 255, 0.08)"
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
        format: 'dd MMM yyyy'
      },
      style: {
        fontSize: '11px',
        fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
      },
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => value ? `${value.toFixed(1)} cm` : '-'
      },
      marker: {
        show: true
      },
      fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
      },
    },
    colors: ["#30D158", "#0A84FF", "#BF5AF2", "#FF9F0A", "#FF453A"],
    stroke: { 
      curve: "smooth",
      width: 2.5,
      lineCap: 'round',
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: "rgba(255, 255, 255, 0.5)",
        useSeriesColors: false
      },
      fontFamily: "SF Pro Display, -apple-system, system-ui, sans-serif",
      fontSize: '11px',
      itemMargin: { 
        horizontal: 12,
        vertical: 8
      },
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      }
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 6,
        sizeOffset: 2
      }
    },
    theme: {
      mode: 'dark',
      palette: 'palette1'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          offsetY: 7,
          itemMargin: {
            horizontal: 8,
            vertical: 8
          }
        },
        yaxis: {
          labels: {
            offsetX: -10
          }
        },
        grid: {
          padding: {
            right: 10,
            left: 10
          }
        }
      }
    }]
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
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10">
      <div className="flex justify-end mb-4 sm:mb-6">
        <button
          onClick={handleToggleAll}
          disabled={measurements.length === 0}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/90 rounded-full bg-white/10 hover:bg-white/20 
                   transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                   font-medium tracking-wide"
        >
          {allSeriesVisible ? "Hide All" : "Show All"}
        </button>
      </div>

      {measurements.length > 0 ? (
        <div className="relative">
          <div className="chart-container">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={300}
            />
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
