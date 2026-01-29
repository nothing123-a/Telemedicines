"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Stethoscope, Pill, Plus, Edit, Trash2, Search, Package, AlertCircle, Bell, CheckCircle, XCircle, LogOut } from "lucide-react";

export default function PharmacistDashboard() {
  const { data: session } = useSession();
  const [medicines, setMedicines] = useState([]);
  const [requestedMedicines, setRequestedMedicines] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    manufacturer: "",
    expiryDate: "",
    stockStatus: "in-stock",
    restockDate: ""
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  useEffect(() => {
    loadMedicines();
    fetchRequestedMedicines();
    
    // Auto-refresh requests every 5 seconds
    const interval = setInterval(fetchRequestedMedicines, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequestedMedicines = async () => {
    try {
      console.log('👨‍⚕️ PHARMACIST: Fetching requested medicines...');
      const response = await fetch('/api/prescription/requested');
      console.log('👨‍⚕️ PHARMACIST: API Response status:', response.status);
      
      const data = await response.json();
      console.log('👨‍⚕️ PHARMACIST: Full API response:', data);
      console.log('👨‍⚕️ PHARMACIST: Prescriptions array:', data.prescriptions);
      console.log('👨‍⚕️ PHARMACIST: Number of prescriptions:', data.prescriptions?.length || 0);
      
      const medicines = data.prescriptions || [];
      console.log('👨‍⚕️ PHARMACIST: Setting requested medicines:', medicines);
      setRequestedMedicines(medicines);
    } catch (error) {
      console.error('👨‍⚕️ PHARMACIST: Error fetching requested medicines:', error);
    }
  };

  const handleAvailability = async (prescriptionId, status) => {
    try {
      const response = await fetch('/api/prescription/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId, status, pharmacistId: 'pharmacist_id' })
      });
      
      if (response.ok) {
        fetchRequestedMedicines();
        alert(`Medicine marked as ${status}`);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const loadMedicines = async () => {
    try {
      console.log('Loading medicines...');
      const res = await fetch('/api/medicine');
      console.log('Load response status:', res.status);
      
      const data = await res.json();
      console.log('Loaded medicines data:', data);
      
      if (res.ok) {
        console.log('Setting medicines:', data.medicines?.length || 0, 'items');
        setMedicines(data.medicines || []);
      } else {
        console.error('Failed to load medicines:', data);
      }
    } catch (error) {
      console.error('Failed to load medicines:', error);
    }
  };

  const saveMedicine = async (medicine, isEdit = false) => {
    try {
      const url = '/api/medicine';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { id: medicine._id, ...medicine } : medicine;
      
      console.log('API call:', method, url, body);
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      console.log('Response status:', res.status, res.statusText);
      
      const result = await res.json();
      console.log('API response:', result);
      
      if (res.ok) {
        console.log('Medicine saved successfully, reloading...');
        await loadMedicines();
      } else {
        console.error('API error - Status:', res.status, 'Result:', result);
        alert(`Error: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save medicine:', error);
      alert(`Failed to save: ${error.message}`);
    }
  };

  const deleteMedicine = async (id) => {
    try {
      const res = await fetch(`/api/medicine?id=${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        loadMedicines();
      }
    } catch (error) {
      console.error('Failed to delete medicine:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const medicineData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      pharmacistId: "temp_id",
      pharmacyName: "Test Pharmacy"
    };
    
    if (editingMedicine) {
      medicineData.id = editingMedicine._id;
    }
    
    console.log('Submitting medicine data:', medicineData, 'isEdit:', !!editingMedicine);
    await saveMedicine(medicineData, !!editingMedicine);
    setFormData({ name: "", category: "", price: "", stock: "", description: "", manufacturer: "", expiryDate: "", stockStatus: "in-stock", restockDate: "" });
    setEditingMedicine(null);
    setShowAddForm(false);
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name || '',
      category: medicine.category || '',
      price: medicine.price?.toString() || '',
      stock: medicine.stock?.toString() || '',
      description: medicine.description || '',
      manufacturer: medicine.manufacturer || '',
      expiryDate: medicine.expiryDate || '',
      stockStatus: medicine.stockStatus || 'in-stock',
      restockDate: medicine.restockDate || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      await deleteMedicine(id);
    }
  };

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Pharmacist Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Manage your pharmacy inventory
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative bg-orange-100 p-3 rounded-full">
                <Bell className="w-8 h-8 text-orange-600" />
                {requestedMedicines.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
                    {requestedMedicines.length}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Pharmacy Inventory
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage medicine stock and availability
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Medicine Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                <option value="Analgesics & Antipyretics">Analgesics & Antipyretics</option>
                <option value="Antibiotics & Antimicrobials">Antibiotics & Antimicrobials</option>
                <option value="Antifungals">Antifungals</option>
                <option value="Antivirals">Antivirals</option>
                <option value="Antiseptics & Disinfectants">Antiseptics & Disinfectants</option>
                <option value="Cough & Cold Preparations">Cough & Cold Preparations</option>
                <option value="Antihistamines / Anti-Allergic">Antihistamines / Anti-Allergic</option>
                <option value="Cardiovascular Medicines">Cardiovascular Medicines</option>
                <option value="Diabetes Medicines">Diabetes Medicines</option>
                <option value="Gastrointestinal Medicines">Gastrointestinal Medicines</option>
                <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                <option value="Dermatological Medicines">Dermatological Medicines</option>
                <option value="Eye/Ear/Nose Preparations">Eye/Ear/Nose Preparations</option>
                <option value="Hormonal Medicines">Hormonal Medicines</option>
                <option value="Oncology Medicines">Oncology Medicines</option>
                <option value="Psychiatric / Neurological">Psychiatric / Neurological</option>
                <option value="Respiratory Medicines">Respiratory Medicines</option>
                <option value="Pediatric Medicines">Pediatric Medicines</option>
                <option value="Geriatric Medicines">Geriatric Medicines</option>
                <option value="Emergency Medicines">Emergency Medicines</option>
              </select>
              <input
                type="number"
                placeholder="Price (₹)"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <input
                type="date"
                placeholder="Expiry Date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <select
                value={formData.stockStatus}
                onChange={(e) => setFormData({...formData, stockStatus: e.target.value})}
                className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="we-dont-sell">We Don't Sell</option>
              </select>
              
              {formData.stockStatus === "out-of-stock" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability Date</label>
                  <input
                    type="date"
                    placeholder="When will medicine be available"
                    value={formData.restockDate || ''}
                    onChange={(e) => setFormData({...formData, restockDate: e.target.value})}
                    className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                  />
                </div>
              )}
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
                required
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium"
                >
                  {editingMedicine ? "Update" : "Add"} Medicine
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMedicine(null);
                    setFormData({ name: "", category: "", price: "", stock: "", description: "", manufacturer: "", expiryDate: "", stockStatus: "in-stock", restockDate: "" });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base ${activeTab === "inventory" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("out-of-stock")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base ${activeTab === "out-of-stock" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Out of Stock
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base relative ${activeTab === "requests" ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Request
            {requestedMedicines.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {requestedMedicines.length}
              </span>
            )}
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "requests" ? (
          /* Medicine Requests */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-600" />
              Medicine Requests ({requestedMedicines.length})
            </h3>
            
            {requestedMedicines.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No medicine requests</p>
            ) : (
              <div className="space-y-4">
                {requestedMedicines.map((prescription) => (
                  <div key={prescription._id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">🔔 Patient: {prescription.patientName}</h4>
                        <p className="text-sm text-gray-600">Dr. {prescription.doctorName} • {new Date(prescription.requestedAt || prescription.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: <span className={`font-medium ${
                            prescription.availability === 'available' ? 'text-green-600' :
                            prescription.availability === 'unavailable' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {prescription.availability || 'Pending'}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleAvailability(prescription._id, 'available')}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 focus:bg-green-600 active:bg-green-700 focus:outline-none"
                          disabled={prescription.availability}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Available
                        </button>
                        <button
                          onClick={() => handleAvailability(prescription._id, 'unavailable')}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 focus:bg-red-600 active:bg-red-700 focus:outline-none"
                          disabled={prescription.availability}
                        >
                          <XCircle className="w-4 h-4" />
                          Out of Stock
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {prescription.medicines.map((medicine, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-800">{medicine.name}</h5>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {medicine.quantity || 'N/A'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Dosage:</span> {medicine.dosage}</p>
                            <p><span className="font-medium">Frequency:</span> {medicine.frequency}</p>
                            <p><span className="font-medium">Duration:</span> {medicine.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Medicine List */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Medicine</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Expiry</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredMedicines
                    .filter(med => activeTab === "inventory" ? med.stockStatus !== "out-of-stock" : med.stockStatus === "out-of-stock")
                    .sort((a, b) => activeTab === "out-of-stock" && a.restockDate && b.restockDate ? new Date(a.restockDate) - new Date(b.restockDate) : 0)
                    .map((medicine) => (
                    <tr key={medicine._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{medicine.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{medicine.manufacturer}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{medicine.category}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white hidden sm:table-cell">{medicine.category}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">₹{medicine.price}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            medicine.stockStatus === 'in-stock' ? 'bg-green-100 text-green-800' : 
                            medicine.stockStatus === 'out-of-stock' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {medicine.stockStatus === 'in-stock' ? `${medicine.stock} units` : 
                             medicine.stockStatus === 'out-of-stock' ? 'Out of Stock' : 
                             "We Don't Sell"}
                          </span>
                          {medicine.stockStatus === 'out-of-stock' && medicine.restockDate && (
                            <div className="text-xs text-gray-500">Available: {medicine.restockDate}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white hidden md:table-cell">{medicine.expiryDate}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium">
                        <div className="flex space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(medicine._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 p-1"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}