'use client';
import { useState, useEffect } from 'react';
import { Plus, Pill, Calendar, Clock, Trash2, Edit } from 'lucide-react';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    doctorName: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/medicines');
      const data = await response.json();
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/medicines/${editingId}` : '/api/medicines';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchMedicines();
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ name: '', dosage: '', frequency: '', startDate: '', endDate: '', doctorName: '' });
      }
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const editMedicine = (medicine) => {
    setFormData({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      startDate: medicine.startDate,
      endDate: medicine.endDate,
      doctorName: medicine.doctorName
    });
    setEditingId(medicine.id);
    setShowAddForm(true);
  };

  const deleteMedicine = async (id) => {
    try {
      await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
      fetchMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">
            My Medicines
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 border-2 border-black"
          >
            <Plus className="w-5 h-5" />
            Add Medicine
          </button>
        </div>

        {/* Add Medicine Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white border-2 border-black rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-black mb-6">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Dosage</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Frequency</label>
                  <select
                    required
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Select frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Doctor Name</label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity border-2 border-black"
                  >
                    {editingId ? 'Update Medicine' : 'Add Medicine'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({ name: '', dosage: '', frequency: '', startDate: '', endDate: '', doctorName: '' });
                    }}
                    className="flex-1 bg-gray-200 text-black py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors border-2 border-black"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medicines List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((medicine, index) => (
            <div key={index} className="bg-white border-2 border-black rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 border border-black rounded-lg">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">{medicine.name}</h3>
                    <p className="text-green-600 font-medium">{medicine.dosage}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => editMedicine(medicine)}
                    className="p-1 text-black hover:text-red-500 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteMedicine(medicine.id)}
                    className="p-1 text-black hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-black">{medicine.frequency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span className="text-black">{medicine.startDate} - {medicine.endDate || 'Ongoing'}</span>
                </div>
                {medicine.doctorName && (
                  <div className="text-black">
                    Prescribed by: {medicine.doctorName}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t-2 border-black">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black">Next dose in</span>
                  <span className="text-sm font-medium text-red-500">2h 30m</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {medicines.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white border-2 border-black rounded-xl p-8 max-w-md mx-auto">
              <Pill className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">No medicines added yet</h3>
              <p className="text-black mb-6">Start tracking your medications by adding your first medicine</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity border-2 border-black"
              >
                Add Your First Medicine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}