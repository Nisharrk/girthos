"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { formatDate, formatCm, formatHeight, formatWeight, getAverageBiceps, getAverageThighs, getAverageCalves } from "@/lib/measurements.mjs";

const subscribe = (callback) => {
  const query = window.matchMedia("(max-width: 639px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const getSnapshot = () => window.matchMedia("(max-width: 639px)").matches;
const getServerSnapshot = () => false;
const PAGE_SIZE = 50;

function RowActions({ onEdit, onDelete, large = false }) {
  const buttonClass = `rounded-full text-gray-400 transition-colors hover:bg-white/10 ${
    large ? "p-3" : "p-1.5"
  }`;
  const iconClass = large ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit measurement"
        className={`${buttonClass} hover:text-white`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconClass}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete measurement"
        className={`${buttonClass} hover:text-red-400`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconClass}
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
  );
}

export default function MeasurementHistory({ measurements, onEdit, onDelete }) {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(measurements.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const entries = useMemo(() => measurements.slice().reverse().slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE), [measurements, currentPage]);
  return <>
  <div>
    <div className="mb-4">
      <h2 className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight">
        Measurement History
      </h2>
    </div>

    {isMobile ? <div className="space-y-3">
      {measurements.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No measurements yet.
        </p>
      ) : (
        entries
          .map((m) => (
            <div
              key={m._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {formatDate(m.date)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatWeight(m.weight)} · {formatHeight(m.height)}
                  </p>
                </div>
                <RowActions
                  large
                  onEdit={() => onEdit(m)}
                  onDelete={() => {
                    onDelete(m);
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Chest", value: formatCm(m.chest) },
                  {
                    label: "Biceps",
                    value: getAverageBiceps(m)
                      ? formatCm(getAverageBiceps(m))
                      : "-",
                  },
                  { label: "Waist", value: formatCm(m.waist) },
                  {
                    label: "Thighs",
                    value: getAverageThighs(m)
                      ? formatCm(getAverageThighs(m))
                      : "-",
                  },
                  {
                    label: "Calves",
                    value: getAverageCalves(m)
                      ? formatCm(getAverageCalves(m))
                      : "-",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white/5 px-2 py-2 text-center"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                      {label}
                    </p>
                    <p className="mt-0.5 text-xs text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div> : <div className="overflow-x-auto">
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
          {entries
            .map((m) => (
              <tr
                key={m._id}
                className="border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4 text-white text-sm">
                  {formatDate(m.date)}
                </td>
                <td className="text-center py-3 px-4 text-white text-sm">
                  {formatHeight(m.height)}
                </td>
                <td className="text-center py-3 px-4 text-white text-sm">
                  {formatWeight(m.weight)}
                </td>
                <td className="text-center py-3 px-4 text-white text-sm">
                  {m.chest ? `${m.chest.toFixed(1)} cm` : "-"}
                </td>
                <td className="text-center py-3 px-4 text-white text-sm">
                  {m.leftBicep && m.rightBicep
                    ? formatCm(getAverageBiceps(m))
                    : "-"}
                </td>
                <td className="text-center py-3 px-4 text-white text-sm">
                  {m.waist ? `${m.waist.toFixed(1)} cm` : "-"}
                </td>
                <td className="text-center py-3 px-4 text-white text-sm">
                  {m.leftThigh && m.rightThigh
                    ? formatCm(getAverageThighs(m))
                    : "-"}
                </td>
                <td className="text-center py-3 px-4 text-white text-sm">
                  {m.leftCalf && m.rightCalf
                    ? formatCm(getAverageCalves(m))
                    : "-"}
                </td>
                <td className="text-center py-3 px-4 text-white text-sm">
                  <RowActions
                    onEdit={() => onEdit(m)}
                    onDelete={() => {
                      onDelete(m);
                    }}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>}
  </div>
    {pages > 1 && <nav aria-label="History pages" className="mt-4 flex items-center justify-between text-sm">
      <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="rounded-full bg-white/10 px-4 py-2 disabled:opacity-40">Previous</button>
      <span>Page {currentPage + 1} of {pages}</span>
      <button type="button" disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)} className="rounded-full bg-white/10 px-4 py-2 disabled:opacity-40">Next</button>
    </nav>}
  </>;
}
