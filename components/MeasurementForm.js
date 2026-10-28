// components/MeasurementForm.js
"use client";
import { useState, useEffect } from "react";
import { NUMERIC_FIELDS, localDate, validateMeasurement } from "@/lib/measurements.mjs";
import { requestJson } from "@/lib/api.mjs";
import FieldError from "@/components/FieldError";
import Modal from "@/components/Modal";

function Field({ label, unit, error, readOnly, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          readOnly={readOnly}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${props.name}-error` : undefined}
          className={`field-input ${
            unit ? "pr-10" : ""
          } ${
            readOnly ? "cursor-not-allowed opacity-60" : ""
          }`}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-gray-500">
            {unit}
          </span>
        )}
      </div>
      <FieldError id={`${props.name}-error`}>{error}</FieldError>
    </label>
  );
}

function Group({ title, children }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">{children}</div>
    </div>
  );
}

export default function MeasurementForm({
  show,
  onClose,
  onSuccess,
  measurement,
  apiKey,
  fixedHeight,
  isGuest = false,
  onGuestSave,
  onUnauthorized,
}) {
  const [formData, setFormData] = useState({
    date: localDate(),
    height: "",
    weight: "",
    chest: "",
    leftBicep: "",
    rightBicep: "",
    waist: "",
    leftThigh: "",
    rightThigh: "",
    leftCalf: "",
    rightCalf: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [heightIsFixed, setHeightIsFixed] = useState(false);

  const update = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
  };


  useEffect(() => {
    if (measurement) {
      setHeightIsFixed(false);
      setFormData({
        date: new Date(measurement.date).toISOString().split("T")[0],
        ...Object.fromEntries(NUMERIC_FIELDS.map((field) => [field, measurement[field] == null ? "" : String(measurement[field])])),
      });
    } else {
      const savedHeight =
        fixedHeight != null
          ? String(fixedHeight)
          : isGuest ? "" : localStorage.getItem("userHeight") ?? "";
      setHeightIsFixed(savedHeight !== "");
      setFormData({
        date: localDate(),
        height: savedHeight,
        weight: "",
        chest: "",
        leftBicep: "",
        rightBicep: "",
        waist: "",
        leftThigh: "",
        rightThigh: "",
        leftCalf: "",
        rightCalf: "",
      });
    }
  }, [measurement, fixedHeight, isGuest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { value, errors } = validateMeasurement(formData);
    for (const input of e.currentTarget.querySelectorAll("input")) {
      if (input.validity.badInput) errors[input.name] = "Enter a valid number";
      else if (input.validity.stepMismatch) errors[input.name] = "Use increments of 0.1";
    }
    setValidationErrors(errors);
    if (Object.keys(errors).length) {
      e.currentTarget.elements.namedItem(Object.keys(errors)[0])?.focus();
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const dataToSubmit = value;

      if (isGuest) {
        onGuestSave(dataToSubmit, measurement?._id);
        onClose();
        return;
      }

      const url = measurement
        ? `/api/measurements?id=${measurement._id}`
        : "/api/measurements";
      const method = measurement ? "PUT" : "POST";
      const body = measurement
        ? { ...dataToSubmit, id: measurement._id }
        : dataToSubmit;

      await requestJson(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!measurement && formData.height) {
        localStorage.setItem("userHeight", formData.height);
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err.status === 401 && onUnauthorized) {
        onUnauthorized();
        return;
      }
      setError(err.message || "Failed to save measurement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <Modal titleId="measurement-form-title" onClose={onClose} sheet>
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 id="measurement-form-title" className="font-display text-xl font-semibold tracking-tight text-white">
            {measurement ? "Edit measurement" : "New measurement"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="button-icon"
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
        </div>

        <form noValidate aria-busy={isSubmitting} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            {isGuest && <p className="text-xs text-gray-400">Guest measurement · Changes aren’t saved.</p>}
            {error && (
              <div role="alert" className="alert-error px-3.5 py-2.5 text-sm leading-relaxed">
                {error}
              </div>
            )}

            <Field
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={update("date")}
              max={localDate()}
              error={validationErrors.date}
              required
            />

            <Group title="Body">
              <Field
                label="Weight"
                unit="kg"
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={update("weight")}
                error={validationErrors.weight}
                required
              />
              <Field
                label="Height"
                unit="cm"
                type="number"
                step="0.1"
                name="height"
                value={formData.height}
                onChange={(event) => {
                  if (measurement || !heightIsFixed) update("height")(event);
                }}
                readOnly={!measurement && heightIsFixed}
                title={!measurement && heightIsFixed ? "Using your saved height" : undefined}
                error={validationErrors.height}
                required
              />
              <Field
                label="Chest"
                unit="cm"
                type="number"
                step="0.1"
                name="chest"
                value={formData.chest}
                onChange={update("chest")}
                error={validationErrors.chest}
              />
              <Field
                label="Waist"
                unit="cm"
                type="number"
                step="0.1"
                name="waist"
                value={formData.waist}
                onChange={update("waist")}
                error={validationErrors.waist}
              />
            </Group>

            <Group title="Arms">
              <Field
                label="Left bicep"
                unit="cm"
                type="number"
                step="0.1"
                name="leftBicep"
                value={formData.leftBicep}
                onChange={update("leftBicep")}
                error={validationErrors.leftBicep}
              />
              <Field
                label="Right bicep"
                unit="cm"
                type="number"
                step="0.1"
                name="rightBicep"
                value={formData.rightBicep}
                onChange={update("rightBicep")}
                error={validationErrors.rightBicep}
              />
            </Group>

            <Group title="Legs">
              <Field
                label="Left thigh"
                unit="cm"
                type="number"
                step="0.1"
                name="leftThigh"
                value={formData.leftThigh}
                onChange={update("leftThigh")}
                error={validationErrors.leftThigh}
              />
              <Field
                label="Right thigh"
                unit="cm"
                type="number"
                step="0.1"
                name="rightThigh"
                value={formData.rightThigh}
                onChange={update("rightThigh")}
                error={validationErrors.rightThigh}
              />
              <Field
                label="Left calf"
                unit="cm"
                type="number"
                step="0.1"
                name="leftCalf"
                value={formData.leftCalf}
                onChange={update("leftCalf")}
                error={validationErrors.leftCalf}
              />
              <Field
                label="Right calf"
                unit="cm"
                type="number"
                step="0.1"
                name="rightCalf"
                value={formData.rightCalf}
                onChange={update("rightCalf")}
                error={validationErrors.rightCalf}
              />
            </Group>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:justify-end sm:px-6 sm:pb-4">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
    </Modal>
  );
}
