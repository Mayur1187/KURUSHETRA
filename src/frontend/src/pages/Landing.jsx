import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  ShieldCheck, 
  Bot, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  FileCheck2,
  Clock,
  Sparkles
} from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();

  const workflowSteps = [
    { num: '01', title: 'Detect', desc: 'Detects supply shortages, minimum requirement conflicts, and canal overlap bottlenecks.' },
    { num: '02', title: 'Reason', desc: 'Evaluates urgency, crop criticality, historical disadvantage, and fairness credits.' },
    { num: '03', title: 'Allocate', desc: 'Deterministic math engine generates initial water volume distribution.' },
    { num: '04', title: 'Negotiate', desc: 'Consent-based digital Farmer Agents evaluate proposal against boundary limits.' },
    { num: '05', title: 'Object', desc: 'Farmers submit natural language complaints (e.g. labor window limitations).' },
    { num: '06', title: 'Recalculate', desc: 'AI extracts hard constraints and recalculates revised allocations & canal schedule.' },
    { num: '07', title: 'Explain', desc: 'Generates transparent factual decision rationales explaining every allocation.' },
    { num: '08', title: 'Agree & Record', desc: 'Finalizes 100% consensus agreement with complete immutable audit log.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-teal-400 mb-6 shadow-lg shadow-teal-500/10">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>JalSangam AI — Digital Water Mediator</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent">
          Autonomous Water Dispute Mediation for Fair Irrigation Sharing
        </h1>

        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Transforming canal water conflicts into transparent, binding consensus. JalSangam AI combines strict deterministic constraint algorithms with autonomous digital agents to detect shortages, handle natural language objections, and guarantee multi-cycle temporal fairness.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl text-base shadow-xl shadow-teal-500/25 transition"
          >
            <span>Open Mediation Control Center</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/negotiation-room')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-6 py-4 rounded-xl text-base transition"
          >
            <Bot className="w-5 h-5 text-cyan-400" />
            <span>Launch Live Negotiation Demo</span>
          </button>
        </div>
      </section>

      {/* Core Principle Banner */}
      <section className="bg-slate-900 border-y border-slate-800 py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-mono font-bold tracking-widest text-teal-400 uppercase">Core Mediation Paradigm</span>
          <p className="mt-3 text-lg md:text-xl font-semibold text-white tracking-wide">
            Detect <span className="text-teal-400">→</span> Reason <span className="text-teal-400">→</span> Allocate <span className="text-teal-400">→</span> Negotiate <span className="text-teal-400">→</span> Object <span className="text-teal-400">→</span> Recalculate <span className="text-teal-400">→</span> Explain <span className="text-teal-400">→</span> Agree <span className="text-teal-400">→</span> Record
          </p>
        </div>
      </section>

      {/* Workflow Steps Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">8-Step Autonomous Mediation Engine</h2>
          <p className="text-sm text-slate-400 mt-2">How JalSangam AI resolves water allocation disputes without human bias</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step) => (
            <div key={step.num} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-teal-500/40 transition">
              <span className="text-3xl font-black font-mono text-slate-800 group-hover:text-teal-500/20 transition absolute top-3 right-4">
                {step.num}
              </span>
              <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
