import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FarmerCard } from '../components/FarmerCard';
import { UserPlus, X } from 'lucide-react';
import { api } from '../services/api';

export const Farmers = () => {
  const { farmers, refreshData } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farmer_name: '',
    land_area: '4.0',
    crop_type: 'Wheat',
    crop_stage: 'Flowering',
    requested_water: '4500',
    minimum_water: '3000',
    urgency: '4',
    preferred_start: '06:00',
    preferred_end: '12:00'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.createFarmer(formData);
    setShowModal(false);
    await refreshData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Farmer Directory & Preferences</h1>
          <p className="text-xs text-slate-400">View and manage farmer irrigation requirements and agent negotiation profiles</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Farmer Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {farmers.map((farmer) => (
          <FarmerCard key={farmer.id} farmer={farmer} />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4">Register New Farmer Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Farmer Name</label>
                <input
                  type="text"
                  required
                  value={formData.farmer_name}
                  onChange={e => setFormData({ ...formData, farmer_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="e.g. Farmer D (Vikram)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Crop Type</label>
                  <input
                    type="text"
                    required
                    value={formData.crop_type}
                    onChange={e => setFormData({ ...formData, crop_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Crop Stage</label>
                  <input
                    type="text"
                    required
                    value={formData.crop_stage}
                    onChange={e => setFormData({ ...formData, crop_stage: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Requested Water (L)</label>
                  <input
                    type="number"
                    required
                    value={formData.requested_water}
                    onChange={e => setFormData({ ...formData, requested_water: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Minimum Water (L)</label>
                  <input
                    type="number"
                    required
                    value={formData.minimum_water}
                    onChange={e => setFormData({ ...formData, minimum_water: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold p-3 rounded-xl transition"
              >
                Save Farmer Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
