import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WaterStats } from '../components/WaterStats';
import { ConflictAlert } from '../components/ConflictAlert';
import { FarmerCard } from '../components/FarmerCard';
import { FairnessMeter } from '../components/FairnessMeter';
import { useApp } from '../context/AppContext';
import { Bot, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { farmers, conflicts, activeMediation, handleStartMediation, loading } = useApp();

  const onStart = async () => {
    await handleStartMediation();
    navigate('/negotiation-room');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Water Management Dashboard</h1>
          <p className="text-xs text-slate-400">Live monitoring of irrigation demand, canal capacity, and active conflicts</p>
        </div>

        <button
          onClick={onStart}
          disabled={loading}
          className="flex items-center justify-center space-x-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-xl shadow-teal-500/20 transition"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span>START AI MEDIATION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <WaterStats />

      {conflicts.map((conflict, idx) => (
        <ConflictAlert key={idx} conflict={conflict} />
      ))}

      <FairnessMeter fairnessScore={activeMediation?.proposal?.fairness_score || 92.5} farmers={farmers} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Participating Farmers & Demand Profiles</h2>
          <span className="text-xs text-slate-400">{farmers.length} Farmers Enrolled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {farmers.map((farmer) => (
            <FarmerCard key={farmer.id} farmer={farmer} />
          ))}
        </div>
      </div>
    </div>
  );
};
