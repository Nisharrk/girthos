"use client";
import { useEffect, useRef, useState } from "react";
import FieldError from "@/components/FieldError";
import { requestJson } from "@/lib/api.mjs";

export default function ApiKeyPrompt({ show, onClose, onConfirm }) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const activeRequest = useRef(null);

  useEffect(() => () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
  }, [show]);

  const handleClose = () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setIsVerifying(false);
    setApiKey("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeRequest.current) return;
    const input = e.currentTarget.elements.namedItem("apiKey");
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      input?.focus();
      return;
    }
    setError("");
    setIsVerifying(true);
    const controller = new AbortController();
    activeRequest.current = controller;
    const key = apiKey.trim();
    try {
      const data = await requestJson("/api/measurements/verify-key", {
        method: "POST",
        headers: { "x-api-key": key },
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (data.verified !== true) throw new Error("Unable to verify API key. Please try again.");
      onConfirm(key);
      setApiKey("");
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err.message || "Unable to verify API key. Please try again.");
        input?.focus();
      }
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setIsVerifying(false);
      }
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-display text-white text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 tracking-tight">
          Enter API Key
        </h2>

        <form noValidate aria-busy={isVerifying} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="api-key" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
              API Key
            </label>
            <input
              id="api-key"
              name="apiKey"
              type="password"
              autoFocus
              readOnly={isVerifying}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "api-key-error" : undefined}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError("");
              }}
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-base text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 sm:text-sm ${error ? "border-red-500/40 focus:border-red-400/60 focus:ring-red-500/15" : "border-white/10 focus:border-white/20 focus:ring-blue-500/30"}`}
              placeholder="API key"
              required
            />
            <FieldError id="api-key-error">{error}</FieldError>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-full px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:text-white sm:flex-none sm:py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 rounded-full bg-blue-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-wait disabled:opacity-50 sm:flex-none sm:py-2"
            >
              {isVerifying ? "Verifying…" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
