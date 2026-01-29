"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DigitalPrescriptionModal({ isOpen, onClose, patientId, doctorId, sessionId }) {
  const { data: session } = useSession();
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const updateMedicine = (index, field, value) => {
    const updated = medicines.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedicines(updated);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create prescription
      const response = await fetch('/api/prescription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          doctorName: session?.user?.name || 'Doctor',
          sessionId,
          medicines: medicines.filter(med => med.name),
          instructions
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Send WebSocket notification to patient
        await fetch('/api/prescription/websocket-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            prescriptionId: data.prescriptionId,
            doctorId,
            doctorName: session?.user?.name || 'Doctor',
            medicines: medicines.filter(med => med.name),
            instructions
          })
        });

        alert("Prescription sent successfully to patient!");
        onClose();
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      alert("Failed to create prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Digital Prescription</h2>
          <p className="text-sm sm:text-base text-gray-600">Create prescription for patient</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Medicines */}
          <div>
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Medicines</h3>
            {medicines.map((medicine, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 p-3 border rounded-lg">
                <input
                  placeholder="Medicine name"
                  value={medicine.name}
                  onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                  className="border rounded px-3 py-2 text-sm sm:text-base"
                />
                <input
                  placeholder="Dosage"
                  value={medicine.dosage}
                  onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                  className="border rounded px-3 py-2 text-sm sm:text-base"
                />
                <input
                  placeholder="Frequency"
                  value={medicine.frequency}
                  onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                  className="border rounded px-3 py-2 text-sm sm:text-base"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Duration"
                    value={medicine.duration}
                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                    className="border rounded px-3 py-2 flex-1 text-sm sm:text-base"
                  />
                  <button
                    onClick={() => removeMedicine(index)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm sm:text-base min-w-[40px]"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addMedicine}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base w-full sm:w-auto"
            >
              + Add Medicine
            </button>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Instructions</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Additional instructions for the patient..."
              className="w-full border rounded px-3 py-2 h-20 sm:h-24 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 sm:px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
          >
            {isSubmitting ? "Sending..." : "Send Prescription"}
          </button>
        </div>
      </div>
    </div>
  );
}