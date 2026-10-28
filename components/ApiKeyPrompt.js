"use client";
import { useEffect, useRef, useState } from "react";
import FieldError from "@/components/FieldError";
import { requestJson } from "@/lib/api.mjs";
import Modal from "@/components/Modal";

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
    <Modal titleId="api-key-title" onClose={handleClose} className="p-5 sm:p-6">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="button-icon absolute right-3 top-3"
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

        <h2 id="api-key-title" className="font-display pr-10 text-xl font-semibold mb-6 tracking-tight text-white">
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
              readOnly={isVerifying}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "api-key-error" : undefined}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError("");
              }}
              className="field-input"
              placeholder="API key"
              required
            />
            <FieldError id="api-key-error">{error}</FieldError>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="button-secondary flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="button-primary flex-1 sm:flex-none"
            >
              {isVerifying ? "Verifying…" : "Confirm"}
            </button>
          </div>
        </form>
    </Modal>
  );
}
