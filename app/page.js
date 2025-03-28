// app/page.js
"use client";
import { useState, useEffect } from "react";
import StatsCard from "@/components/StatsCard";
import ProgressChart from "@/components/ProgressChart";
import MeasurementForm from "@/components/MeasurementForm";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function Home() {
  const [measurements, setMeasurements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const latest = measurements[measurements.length - 1] || {};
  const previous = measurements[measurements.length - 2] || {};

  // Format height in cm
  const formatHeight = (heightCm) => {
    if (!heightCm) return "- cm";
    return `${heightCm.toFixed(1)} cm`;
  };

  // Convert lbs to kg
  const formatWeight = (weightLbs) => {
    if (!weightLbs) return "-";
    return (Number(weightLbs) * 0.453592).toFixed(1);
  };

  // Get numeric weight in kg
  const getWeightInKg = (weightLbs) => {
    if (!weightLbs) return null;
    return Number(weightLbs) * 0.453592;
  };

  // Calculate average biceps
  const getAverageBiceps = (measurement) => {
    if (!measurement?.leftBicep || !measurement?.rightBicep) return null;
    return (
      (Number(measurement.leftBicep) + Number(measurement.rightBicep)) /
      2
    ).toFixed(1);
  };

  // Calculate average thighs
  const getAverageThighs = (measurement) => {
    if (!measurement?.leftThigh || !measurement?.rightThigh) return null;
    return (
      (Number(measurement.leftThigh) + Number(measurement.rightThigh)) /
      2
    ).toFixed(1);
  };

  // Calculate average calves
  const getAverageCalves = (measurement) => {
    if (!measurement?.leftCalf || !measurement?.rightCalf) return null;
    return (
      (Number(measurement.leftCalf) + Number(measurement.rightCalf)) /
      2
    ).toFixed(1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/measurements");
      const data = await response.json();
      setMeasurements(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (measurement) => {
    setEditingMeasurement(measurement);
    setShowForm(true);
  };

  const handleDelete = async (measurement) => {
    try {
      const response = await fetch(`/api/measurements?id=${measurement._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete measurement");
      }

      fetchData();
      setShowDeleteConfirm(false);
      setMeasurementToDelete(null);
    } catch (error) {
      console.error("Error deleting measurement:", error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMeasurement(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            girthOS
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            Track your girth
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Current Weight"
                value={`${formatWeight(latest.weight) || "-"} kg`}
                previousValue={getWeightInKg(previous.weight)}
              />
              <StatsCard
                title="Current Height"
                value={formatHeight(latest.height)}
                previousValue={previous.height}
              />
              <StatsCard
                title="Biceps"
                value={`${getAverageBiceps(latest) || "-"} cm`}
                previousValue={getAverageBiceps(previous)}
              />
              <StatsCard
                title="Chest"
                value={`${latest.chest || "-"} cm`}
                previousValue={previous.chest}
              />
            </div>

            {/* Add Measurement Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 sm:px-6 py-2.5 rounded-full 
                         transition-colors duration-200 font-medium tracking-wide text-sm sm:text-base"
              >
                <span>+</span>
                <span>Add Measurement</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 sm:gap-6 border-b border-white/10 mb-4 sm:mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("chart")}
                className={`pb-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === "chart"
                    ? "text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Charts
                </span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === "history"
                    ? "text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  History
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white/5 sm:bg-black backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10">
              {activeTab === "chart" ? (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-2 text-white tracking-tight">
                    Progress Tracking
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 sm:mb-6">
                    Track your body measurements over time
                  </p>
                  <ProgressChart measurements={measurements} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                      Measurement History
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="text-left border-b border-white/10">
                          <th className="pb-3 text-sm font-medium text-gray-400">
                            Date
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-400 text-center">
                            Height
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-400 text-center">
                            Weight
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-400 text-center">
                            Chest
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-400 text-center">
                            Biceps
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-400 text-center">
                            Waist
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-400 text-center">
                            Thighs
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-400 text-center">
                            Calves
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-400 text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {measurements
                          .slice()
                          .reverse()
                          .map((m) => (
                            <tr
                              key={m._id}
                              className="border-b border-white/10 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-3 px-4 text-white text-sm">
                                {new Date(m.date).toLocaleDateString()}
                              </td>
                              <td className="text-center py-3 px-4 text-white text-sm">
                                {formatHeight(m.height)}
                              </td>
                              <td className="text-center py-3 px-4 text-white text-sm">
                                {formatWeight(m.weight)}
                              </td>
                              <td className="text-center py-3 px-4 text-white text-sm">
                                {m.chest
                                  ? (Number(m.chest) * 2.54).toFixed(1)
                                  : "-"}
                              </td>
                              <td className="text-center py-3 px-4 text-white text-sm">
                                {m.leftBicep && m.rightBicep
                                  ? (
                                      ((Number(m.leftBicep) +
                                        Number(m.rightBicep)) /
                                        2) *
                                      2.54
                                    ).toFixed(1)
                                  : "-"}
                              </td>
                              <td className="text-center py-3 px-4 text-white text-sm">
                                {m.waist
                                  ? (Number(m.waist) * 2.54).toFixed(1)
                                  : "-"}
                              </td>
                              <td className="text-center py-3 px-4 text-white text-sm">
                                {m.leftThigh && m.rightThigh
                                  ? (
                                      ((Number(m.leftThigh) +
                                        Number(m.rightThigh)) /
                                        2) *
                                      2.54
                                    ).toFixed(1)
                                  : "-"}
                              </td>
                              <td className="text-center py-3 px-4 text-white text-sm">
                                {m.leftCalf && m.rightCalf
                                  ? (
                                      ((Number(m.leftCalf) +
                                        Number(m.rightCalf)) /
                                        2) *
                                      2.54
                                    ).toFixed(1)
                                  : "-"}
                              </td>
                              <td className="text-center py-3 px-4 text-white text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEdit(m)}
                                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMeasurementToDelete(m);
                                      setShowDeleteConfirm(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/10"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Measurement Form Modal */}
      {showForm && (
        <MeasurementForm
          show={showForm}
          onClose={handleFormClose}
          onSuccess={fetchData}
          measurement={editingMeasurement}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Delete Measurement
            </h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this measurement? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMeasurementToDelete(null);
                }}
                className="px-6 py-2.5 text-sm text-white/90 rounded-full bg-white/10 hover:bg-white/20 
                         transition-colors duration-200 font-medium tracking-wide"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(measurementToDelete)}
                className="px-6 py-2.5 text-sm text-white rounded-full bg-red-500 hover:bg-red-600 
                         transition-colors duration-200 font-medium tracking-wide"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
