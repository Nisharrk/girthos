// app/page.js
"use client";
import { useMemo, useState } from "react";
import useMeasurements from "@/hooks/useMeasurements";
import MeasurementHistory from "@/components/MeasurementHistory";
import { getAverageBiceps, getMetricTrend } from "@/lib/measurements.mjs";
import StatsCard from "@/components/StatsCard";
import ProgressChart from "@/components/ProgressChart";
import MeasurementForm from "@/components/MeasurementForm";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ApiKeyPrompt from "@/components/ApiKeyPrompt";
import { createGuestSamples, saveGuestMeasurement } from "@/lib/guestMeasurements.mjs";

export default function Home() {
  const [session, setSession] = useState(null);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  if (session) {
    return <Dashboard isGuest={session.mode === "guest"} initialApiKey={session.apiKey || ""} onExit={() => setSession(null)} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 text-white sm:p-6">
      <div className="w-full max-w-sm space-y-10">
        <div className="space-y-3 text-center">
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">girthOS</h1>
          <p className="text-gray-400">Track your girth</p>
        </div>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setSession({ mode: "guest" })} className="rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-6 text-center transition hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-white/60">
              <span className="block text-base font-medium">Guest</span>
              <span className="mt-1 block text-xs text-gray-500">Explore</span>
            </button>
            <button type="button" onClick={() => setShowAdminPrompt(true)} className="rounded-2xl border border-white/10 px-4 py-6 text-center transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-white/60">
              <span className="block text-base font-medium">Admin</span>
              <span className="mt-1 block text-xs text-gray-500">API key</span>
            </button>
          </div>
          <p className="text-center text-xs text-gray-500">Guest sessions aren&apos;t saved.</p>
        </div>
      </div>
      <ApiKeyPrompt show={showAdminPrompt} onClose={() => setShowAdminPrompt(false)} onConfirm={(apiKey) => {
        setShowAdminPrompt(false);
        setSession({ mode: "admin", apiKey });
      }} />
    </main>
  );
}

function Dashboard({ isGuest, initialApiKey, onExit }) {
  const { measurements: storedMeasurements, isLoading: storedLoading, error: storedError, refresh: fetchData, remove } = useMeasurements(!isGuest);
  const [guestMeasurements, setGuestMeasurements] = useState([]);
  const measurements = isGuest ? guestMeasurements : storedMeasurements;
  const isLoading = !isGuest && storedLoading;
  const error = isGuest ? "" : storedError;
  const [actionError, setActionError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState(null);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const summary = useMemo(() => ({
    weight: getMetricTrend(measurements, (m) => m.weight),
    height: getMetricTrend(measurements, (m) => m.height),
    biceps: getMetricTrend(measurements, getAverageBiceps),
    chest: getMetricTrend(measurements, (m) => m.chest),
  }), [measurements]);
  const savedHeight = [...measurements]
    .reverse()
    .find((measurement) => measurement.height != null)?.height;

  const handleApiKeyConfirm = (key) => {
    setApiKey(key);
    setShowApiKeyPrompt(false);

    if (pendingAction) {
      if (pendingAction.type === "delete") {
        handleDelete(pendingAction.measurement, key);
      } else if (pendingAction.type === "edit") {
        setEditingMeasurement(pendingAction.measurement);
        setShowForm(true);
      } else if (pendingAction.type === "add") {
        setShowForm(true);
      }
      setPendingAction(null);
    }
  };

  const handleEdit = (measurement) => {
    if (isGuest || apiKey) {
      setEditingMeasurement(measurement);
      setShowForm(true);
      return;
    }
    setPendingAction({ type: "edit", measurement });
    setShowApiKeyPrompt(true);
  };

  const handleDelete = async (measurement, key = apiKey) => {
    if (isDeleting) return;
    setIsDeleting(true);
    setActionError("");
    try {
      if (isGuest) {
        setGuestMeasurements((current) => current.filter((entry) => entry._id !== measurement._id));
      } else {
        await remove(measurement._id, key);
      }
      setShowDeleteConfirm(false);
      setMeasurementToDelete(null);
    } catch (error) {
      if (error.status === 401) setApiKey("");
      setActionError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddMeasurement = () => {
    if (isGuest || apiKey) {
      setShowForm(true);
      return;
    }
    setPendingAction({ type: "add" });
    setShowApiKeyPrompt(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMeasurement(null);
  };

  const handleDeleteClick = () => {
    if (isGuest || apiKey) {
      handleDelete(measurementToDelete);
      return;
    }
    setPendingAction({ type: "delete", measurement: measurementToDelete });
    setShowApiKeyPrompt(true);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white">
            girthOS
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            Track your girth
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
          <p className="text-gray-400">{isGuest ? "Guest mode · Your changes are temporary and clear when you leave or reload." : "Admin mode · Your measurements are saved."}</p>
          <button type="button" onClick={onExit} className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20">{isGuest ? "Exit guest mode" : "Sign out"}</button>
        </div>

        {(error || actionError) && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <p>{actionError || error}</p>
          {error && <button type="button" onClick={fetchData} className="mt-2 underline">Retry loading measurements</button>}
        </div>}
        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatsCard
                title="Current Weight"
                {...summary.weight}
                unit="kg"
              />
              <StatsCard
                title="Current Height"
                {...summary.height}
                unit="cm"
              />
              <StatsCard
                title="Latest Biceps"
                {...summary.biceps}
                unit="cm"
              />
              <StatsCard
                title="Latest Chest"
                {...summary.chest}
                unit="cm"
              />
            </div>

            {/* Add Measurement Button */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddMeasurement}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-medium tracking-wide text-white transition-colors duration-200 hover:bg-white/20 active:bg-white/25 sm:w-auto sm:px-6 sm:py-2.5 sm:text-base"
              >
                <span>+</span>
                <span>Add Measurement</span>
              </button>
              {isGuest && <button type="button" onClick={() => {
                setGuestMeasurements(createGuestSamples());
                setActionError("");
                setActiveTab("chart");
              }} className="w-full rounded-full bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-600 sm:w-auto sm:py-2.5 sm:text-base">
                {guestMeasurements.length === 0 ? "Fill with sample data" : "Reset to sample data"}
              </button>}
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
            <div className="bg-black backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10">
              {activeTab === "chart" ? (
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold mb-2 text-white tracking-tight">
                    Progress Tracking
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 sm:mb-6">
                    Track your body measurements over time
                  </p>
                  <ProgressChart measurements={measurements} />
                </div>
              ) : (
                <MeasurementHistory measurements={measurements} onEdit={handleEdit} onDelete={(measurement) => {
                  setMeasurementToDelete(measurement);
                  setShowDeleteConfirm(true);
                }} />
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
          apiKey={apiKey}
          fixedHeight={savedHeight}
          isGuest={isGuest}
          onGuestSave={(value, id) => {
            const guestId = id || `guest-${crypto.randomUUID()}`;
            setGuestMeasurements((current) => saveGuestMeasurement(current, value, guestId));
          }}
          onUnauthorized={() => {
            setApiKey("");
            setPendingAction({ type: editingMeasurement ? "edit" : "add", measurement: editingMeasurement });
            setShowForm(false);
            setShowApiKeyPrompt(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <h2 className="font-display mb-3 text-xl font-semibold text-white">
              Delete Measurement
            </h2>
            <p className="mb-6 text-sm text-gray-400 sm:text-base">
              Are you sure you want to delete this measurement? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMeasurementToDelete(null);
                }}
                className="flex-1 rounded-full bg-white/10 px-5 py-3 text-sm font-medium tracking-wide text-white/90 transition-colors duration-200 hover:bg-white/20 sm:flex-none sm:px-6 sm:py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="flex-1 rounded-full bg-red-500 px-5 py-3 text-sm font-medium tracking-wide text-white transition-colors duration-200 hover:bg-red-600 sm:flex-none sm:px-6 sm:py-2.5"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Prompt */}
      <ApiKeyPrompt
        show={showApiKeyPrompt}
        onClose={() => {
          setShowApiKeyPrompt(false);
          setPendingAction(null);
        }}
        onConfirm={handleApiKeyConfirm}
      />
    </div>
  );
}
