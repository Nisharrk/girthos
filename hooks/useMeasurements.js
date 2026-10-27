"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { requestJson } from "@/lib/api.mjs";

export default function useMeasurements() {
  const [measurements, setMeasurements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const activeRequest = useRef(null);
  const refresh = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setIsLoading(true);
    setError("");
    try {
      const data = await requestJson("/api/measurements", { signal: controller.signal });
      if (!Array.isArray(data)) throw new Error("The server returned invalid measurements.");
      if (!controller.signal.aborted) setMeasurements(data);
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    return () => activeRequest.current?.abort();
  }, [refresh]);
  const remove = async (id, apiKey) => {
    await requestJson(`/api/measurements?id=${encodeURIComponent(id)}`, {
      method: "DELETE", headers: { "x-api-key": apiKey },
    });
    setMeasurements((current) => current.filter((entry) => entry._id !== id));
  };
  return { measurements, isLoading, error, refresh, remove };
}
