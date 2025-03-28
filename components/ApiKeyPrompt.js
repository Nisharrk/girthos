"use client";
import { useState } from "react";

export default function ApiKeyPrompt({ show, onClose, onConfirm }) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }
    onConfirm(apiKey);
    setApiKey("");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl w-full max-w-md p-4 sm:p-6 relative border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
        >
          ✕
        </button>

        <h2 className="text-white text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 tracking-tight">
          Enter API Key
        </h2>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white text-sm
                       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                       focus:border-transparent transition-all duration-200"
              placeholder="Enter your API key"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 