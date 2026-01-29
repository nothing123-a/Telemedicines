"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FileText, Calendar, User, Pill, Clock, Download, Trash2 } from "lucide-react";

export default function PrescriptionsPage() {
  const { data: session } = useSession();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPrescriptions();
      
      // Check for real-time prescription notifications
      const checkNotifications = setInterval(() => {
        checkForNewPrescriptions();
      }, 2000);
      
      return () => clearInterval(checkNotifications);
    }
  }, [session]);
  
  const checkForNewPrescriptions = async () => {
    try {
      const response = await fetch(`/api/prescription/check-new?userId=${session.user.id}`);
      const data = await response.json();
      
      if (data.hasNewPrescription) {
        // Refresh prescriptions list
        fetchPrescriptions();
        
        // Show notification
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(
            'Great news! You have received a new prescription from your doctor.'
          );
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error checking for new prescriptions:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`/api/prescription/user?userId=${session.user.id}`);
      const data = await response.json();
      setPrescriptions(data.prescriptions || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (prescriptionId) => {
    window.open(`/api/prescription/download?id=${prescriptionId}`, '_blank');
  };

  const handleDelete = async (prescriptionId) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return;
    
    try {
      const response = await fetch(`/api/prescription/delete?id=${prescriptionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPrescriptions(prescriptions.filter(p => p._id !== prescriptionId));
        alert('Prescription deleted successfully');
      } else {
        alert('Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription');
    }
  };

  const handlePharmacyRequest = async (prescriptionId) => {
    try {
      console.log('🚀 Sending pharmacy request for prescription:', prescriptionId);
      console.log('👤 User ID:', session.user.id);
      
      const response = await fetch('/api/pharmacy/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId, userId: session.user.id })
      });
      
      console.log('📡 Pharmacy request response status:', response.status);
      const result = await response.json();
      console.log('📋 Pharmacy request result:', result);
      
      if (response.ok) {
        alert('Request sent to pharmacy! They will check availability.');
        fetchPrescriptions();
      } else {
        console.error('❌ Pharmacy request failed:', result);
        alert('Failed to send request: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Error sending pharmacy request:', error);
      alert('Error sending request: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-full sm:max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Prescriptions</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Digital prescriptions from your doctors</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">Digital & Secure</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">Auto-Updated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {prescriptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Prescriptions Yet</h3>
            <p className="text-gray-600 mb-6">Your digital prescriptions will appear here after doctor consultations</p>
            <button 
              onClick={() => window.location.href = '/dashboard/routine-doctor'}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Consult a Doctor
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                {/* Prescription Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold">{prescription.doctorName || 'Dr. Unknown'}</h3>
                        <p className="text-sm sm:text-base text-blue-100">Digital Prescription</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-2 text-blue-100 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(prescription.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-blue-200">
                        {new Date(prescription.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medicines */}
                <div className="p-4 sm:p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Prescribed Medicines
                  </h4>
                  
                  <div className="space-y-3 mb-6">
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Medicine</p>
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">{medicine.name}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Dosage</p>
                            <p className="font-medium text-gray-700 text-sm sm:text-base">{medicine.dosage}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Frequency</p>
                            <p className="font-medium text-gray-700 text-sm sm:text-base">{medicine.frequency}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-700 text-sm sm:text-base">{medicine.duration}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  {prescription.instructions && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">Doctor's Instructions</h5>
                      <p className="text-blue-800">{prescription.instructions}</p>
                    </div>
                  )}

                  {/* Availability Status */}
                  {prescription.availability && (
                    <div className={`p-3 rounded-lg mb-4 ${
                      prescription.availability === 'available' ? 'bg-green-50 border border-green-200' :
                      prescription.availability === 'unavailable' ? 'bg-red-50 border border-red-200' :
                      'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        prescription.availability === 'available' ? 'text-green-800' :
                        prescription.availability === 'unavailable' ? 'text-red-800' :
                        'text-yellow-800'
                      }`}>
                        Medicine Status: {prescription.availability === 'available' ? '✅ Available at Pharmacy' :
                        prescription.availability === 'unavailable' ? '❌ Currently Unavailable' :
                        '⏳ Checking Availability'}
                      </p>
                    </div>
                  )}

                  {/* Pharmacy Request Status */}
                  {prescription.pharmacyRequested && (
                    <div className="p-3 rounded-lg mb-4 bg-blue-50 border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">
                        🔔 Request sent to pharmacy - Waiting for response
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-4 border-t border-gray-200 gap-3 sm:gap-0">
                    <div className="text-xs sm:text-sm text-gray-500">
                      ID: {prescription._id.slice(-8)}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => handleDownload(prescription._id)}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                        <span className="sm:hidden">Download</span>
                      </button>
                      {prescription.availability === 'available' ? (
                        <button 
                          onClick={() => {
                            if (confirm('Medicine is available! Do you want to place an order?')) {
                              alert('Order placed successfully! You will be contacted for delivery.');
                            }
                          }}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          <Pill className="w-4 h-4" />
                          <span className="hidden sm:inline">Order Now</span>
                          <span className="sm:hidden">Order</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePharmacyRequest(prescription._id)}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          disabled={prescription.pharmacyRequested}
                        >
                          <Pill className="w-4 h-4" />
                          <span className="hidden sm:inline">{prescription.pharmacyRequested ? 'Request Sent' : 'Check Pharmacy'}</span>
                          <span className="sm:hidden">{prescription.pharmacyRequested ? 'Sent' : 'Check'}</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(prescription._id)}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}