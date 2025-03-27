// components/MeasurementForm.js
"use client";
import { useState, useEffect } from "react";

export default function MeasurementForm({ show, onClose, onSuccess, measurement }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
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
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Convert lbs to kg
  const lbsToKg = (lbs) => {
    if (!lbs) return "";
    return (Number(lbs) * 0.453592).toFixed(1);
  };

  // Convert kg to lbs
  const kgToLbs = (kg) => {
    if (!kg) return "";
    return (Number(kg) / 0.453592).toFixed(1);
  };

  // Convert inches to cm
  const inchesToCm = (inches) => {
    if (!inches) return "";
    return (Number(inches) * 2.54).toFixed(1);
  };

  // Convert cm to inches
  const cmToInches = (cm) => {
    if (!cm) return "";
    return (Number(cm) / 2.54).toFixed(1);
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    const today = new Date();
    const selectedDate = new Date(formData.date);

    // Date validation
    if (selectedDate > today) {
      errors.date = "Future dates are not allowed";
    }

    // Required fields validation
    if (!formData.date) errors.date = "Date is required";
    if (!formData.weight) errors.weight = "Weight is required";
    if (!formData.height) errors.height = "Height is required";

    // Negative value validation
    const numericFields = [
      "height", "weight", "chest", "leftBicep", "rightBicep",
      "waist", "leftThigh", "rightThigh", "leftCalf", "rightCalf"
    ];

    numericFields.forEach(field => {
      if (formData[field] && Number(formData[field]) < 0) {
        errors[field] = "Value cannot be negative";
      }
    });

    // Range validation
    if (formData.height && (Number(formData.height) < 50 || Number(formData.height) > 300)) {
      errors.height = "Height must be between 50 and 300 cm";
    }

    if (formData.weight && (Number(formData.weight) < 20 || Number(formData.weight) > 300)) {
      errors.weight = "Weight must be between 20 and 300 kg";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (measurement) {
      setFormData({
        date: new Date(measurement.date).toISOString().split("T")[0],
        height: measurement.height ? String(measurement.height) : "",
        weight: measurement.weight ? lbsToKg(measurement.weight) : "",
        chest: measurement.chest ? inchesToCm(measurement.chest) : "",
        leftBicep: measurement.leftBicep ? inchesToCm(measurement.leftBicep) : "",
        rightBicep: measurement.rightBicep ? inchesToCm(measurement.rightBicep) : "",
        waist: measurement.waist ? inchesToCm(measurement.waist) : "",
        leftThigh: measurement.leftThigh ? inchesToCm(measurement.leftThigh) : "",
        rightThigh: measurement.rightThigh ? inchesToCm(measurement.rightThigh) : "",
        leftCalf: measurement.leftCalf ? inchesToCm(measurement.leftCalf) : "",
        rightCalf: measurement.rightCalf ? inchesToCm(measurement.rightCalf) : "",
      });
    } else {
      const savedHeight = localStorage.getItem("userHeight");
      setFormData({
        date: new Date().toISOString().split("T")[0],
        height: savedHeight || "",
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
  }, [measurement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsLoading(true);
    setError("");

    try {
      // Convert weight from kg to lbs and measurements from cm to inches before saving
      const weightInLbs = kgToLbs(formData.weight);
      const chestInInches = cmToInches(formData.chest);
      const leftBicepInInches = cmToInches(formData.leftBicep);
      const rightBicepInInches = cmToInches(formData.rightBicep);
      const waistInInches = cmToInches(formData.waist);
      const leftThighInInches = cmToInches(formData.leftThigh);
      const rightThighInInches = cmToInches(formData.rightThigh);
      const leftCalfInInches = cmToInches(formData.leftCalf);
      const rightCalfInInches = cmToInches(formData.rightCalf);

      const dataToSubmit = {
        ...formData,
        weight: weightInLbs,
        chest: chestInInches,
        leftBicep: leftBicepInInches,
        rightBicep: rightBicepInInches,
        waist: waistInInches,
        leftThigh: leftThighInInches,
        rightThigh: rightThighInInches,
        leftCalf: leftCalfInInches,
        rightCalf: rightCalfInInches,
      };

      const url = measurement
        ? `/api/measurements?id=${measurement._id}`
        : "/api/measurements";
      const method = measurement ? "PUT" : "POST";
      const body = measurement ? { ...dataToSubmit, id: measurement._id } : dataToSubmit;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to save measurement");
      }

      // Save height to localStorage
      if (!measurement && formData.height) {
        localStorage.setItem("userHeight", formData.height);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save measurement");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl w-full max-w-2xl p-6 relative border border-white/10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
        >
          ✕
        </button>
        
        <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">
          {measurement ? "Edit Measurement" : "Add New Measurement"}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full bg-white/5 border ${
                validationErrors.date ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl px-4 py-3 text-white 
                       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                       focus:border-transparent transition-all duration-200`}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            {validationErrors.date && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.date}</p>
            )}
          </div>

          {/* Primary Measurements */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className={`w-full bg-white/5 border ${
                  validationErrors.weight ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3 text-white 
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                         focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                placeholder="Enter weight in kg"
                required
              />
              {validationErrors.weight && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.weight}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                name="height"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className={`w-full bg-white/5 border ${
                  validationErrors.height ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3 text-white 
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                         focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                placeholder="Enter height in cm"
                required
              />
              {validationErrors.height && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.height}</p>
              )}
            </div>
          </div>

          {/* Upper Body */}
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-4 tracking-wide">Upper Body (cm)</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Chest</label>
                <input
                  type="number"
                  step="0.1"
                  name="chest"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  className={`w-full bg-white/5 border ${
                    validationErrors.chest ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                           focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="Enter chest in cm"
                  required
                />
                {validationErrors.chest && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.chest}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Left Bicep</label>
                <input
                  type="number"
                  step="0.1"
                  name="leftBicep"
                  value={formData.leftBicep}
                  onChange={(e) => setFormData({ ...formData, leftBicep: e.target.value })}
                  className={`w-full bg-white/5 border ${
                    validationErrors.leftBicep ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                           focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="Enter left bicep in cm"
                  required
                />
                {validationErrors.leftBicep && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.leftBicep}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Right Bicep</label>
                <input
                  type="number"
                  step="0.1"
                  name="rightBicep"
                  value={formData.rightBicep}
                  onChange={(e) => setFormData({ ...formData, rightBicep: e.target.value })}
                  className={`w-full bg-white/5 border ${
                    validationErrors.rightBicep ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                           focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="Enter right bicep in cm"
                  required
                />
                {validationErrors.rightBicep && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.rightBicep}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lower Body */}
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-4 tracking-wide">Lower Body (cm)</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Waist</label>
                <input
                  type="number"
                  step="0.1"
                  name="waist"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  className={`w-full bg-white/5 border ${
                    validationErrors.waist ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                           focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="Enter waist in cm"
                  required
                />
                {validationErrors.waist && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.waist}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Left Thigh</label>
                <input
                  type="number"
                  step="0.1"
                  name="leftThigh"
                  value={formData.leftThigh}
                  onChange={(e) => setFormData({ ...formData, leftThigh: e.target.value })}
                  className={`w-full bg-white/5 border ${
                    validationErrors.leftThigh ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                           focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="Enter left thigh in cm"
                  required
                />
                {validationErrors.leftThigh && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.leftThigh}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Right Thigh</label>
                <input
                  type="number"
                  step="0.1"
                  name="rightThigh"
                  value={formData.rightThigh}
                  onChange={(e) => setFormData({ ...formData, rightThigh: e.target.value })}
                  className={`w-full bg-white/5 border ${
                    validationErrors.rightThigh ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                           focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="Enter right thigh in cm"
                  required
                />
                {validationErrors.rightThigh && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.rightThigh}</p>
                )}
              </div>
            </div>
          </div>

          {/* Calves */}
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-4 tracking-wide">Calves (cm)</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Left Calf</label>
                <input
                  type="number"
                  step="0.1"
                  name="leftCalf"
                  value={formData.leftCalf}
                  onChange={(e) => setFormData({ ...formData, leftCalf: e.target.value })}
                  className={`w-full bg-white/5 border ${
                    validationErrors.leftCalf ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                           focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="Enter left calf in cm"
                  required
                />
                {validationErrors.leftCalf && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.leftCalf}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Right Calf</label>
                <input
                  type="number"
                  step="0.1"
                  name="rightCalf"
                  value={formData.rightCalf}
                  onChange={(e) => setFormData({ ...formData, rightCalf: e.target.value })}
                  className={`w-full bg-white/5 border ${
                    validationErrors.rightCalf ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-white 
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 
                           focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="Enter right calf in cm"
                  required
                />
                {validationErrors.rightCalf && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.rightCalf}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-white/80 hover:text-white 
                       bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 
                       rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Measurement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
