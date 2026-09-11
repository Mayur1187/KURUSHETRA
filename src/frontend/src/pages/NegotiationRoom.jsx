import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProposalCard } from '../components/ProposalCard';
import { AgentMessage } from '../components/AgentMessage';
import { NegotiationTimeline } from '../components/NegotiationTimeline';
import { WaterSchedule } from '../components/WaterSchedule';
import { Bot, User, Send, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NegotiationRoom = () => {
  const navigate = useNavigate();
  const { activeMediation, handleStartMediation, handleSubmitObjection, loading } = useApp();
  const [objectionText, setObjectionText] = useState(
    "I cannot irrigate after 2 PM because workers are unavailable."
  );
  const [selectedFarmer, setSelectedFarmer] = useState("farmer-b");
  const [isRenegotiated, setIsRenegotiated] = useState(false);

  useEffect(() => {
    if (!activeMediation) {
      handleStartMediation();
    }
  }, []);

  const mediation = activeMediation;
  const initialProposal = mediation?.proposal;
  const revisedProposal = mediation?.revised_data?.revised_proposal;

  const currentProposal = revisedProposal || initialProposal;

  const onSubmitObjection = async (e) => {
    e.preventDefault();
    if (!objectionText.trim()) return;
    await handleSubmitObjection(selectedFarmer, objectionText);
    setIsRenegotiated(true);
  };

  const auditEvents = mediation?.revised_data?.audit_logs || [
    { event_type: 'CONFLICT_DETECTED', event_data: { description: 'Water shortage of 5,000 Liters detected.' }, timestamp: '10:00 AM' },
    { event_type: 'PROPOSAL_GENERATED', event_data: { description: 'Round 1 Initial Proposal computed by Allocation Engine.' }, timestamp: '10:01 AM' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-bold">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-white">JalNyay AI — Mediation Control Room</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  {isRenegotiated ? 'Round 2: Consensus Finalized' : 'Round 1: Active Negotiation'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Autonomous consent-based multi-agent negotiation & objection processing</p>
            </div>
          </div>

          {isRenegotiated && (
            <button
              onClick={() => navigate('/agreement')}
              className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition"
            >
              <span>View Final Agreement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Proposals & Live Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <ProposalCard proposal={currentProposal} isRevised={isRenegotiated} />

          <WaterSchedule schedule={currentProposal?.schedule} />

          {/* Farmer Objection Drawer */}
          {!isRenegotiated && (
            <div className="bg-slate-800/90 border border-amber-500/40 rounded-xl p-5 shadow-xl">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Submit Farmer Objection (Demo Workflow)</h3>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Test the AI natural language objection parser. The objection will be parsed into a hard system constraint, forcing the JalNyay AI Mediator to renegotiate and revise the canal delivery schedule.
              </p>

              <form onSubmit={onSubmitObjection} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Farmer Objecting:</label>
                  <select
                    value={selectedFarmer}
                    onChange={e => setSelectedFarmer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="farmer-b">Farmer B (Suresh) — Vegetables (Morning pref)</option>
                    <option value="farmer-a">Farmer A (Ramesh) — Wheat</option>
                    <option value="farmer-c">Farmer C (Mahesh) — Sugarcane</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Natural Language Objection:</label>
                  <textarea
                    rows={2}
                    value={objectionText}
                    onChange={e => setObjectionText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Enter objection..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Objection & Trigger AI Renegotiation</span>
                </button>
              </form>
            </div>
          )}

          {/* AI Extracted Constraint Badge after renegotiation */}
          {isRenegotiated && (
            <div className="bg-teal-950/60 border border-teal-500/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-teal-200">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-300 block">AI Structured Constraint Added to Constraint Engine:</span>
                <p className="mt-0.5">
                  Type: <strong className="text-white">TIME_AVAILABILITY</strong> • Hard Limit: <strong className="text-white">Must end by 14:00</strong> • Reason: <em className="text-slate-300">Labor unavailable after 2 PM</em>.
                </p>
                <p className="mt-1 text-slate-300">
                  Allocation Engine updated rules, and Farmer A Agent accepted time shift to accommodate Farmer B.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Negotiation Feed & Audit Timeline */}
        <div className="space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg max-h-[500px] overflow-y-auto">
            <h3 className="font-bold text-base text-white mb-4 flex items-center space-x-2 sticky top-0 bg-slate-800 py-1 border-b border-slate-700/60">
              <Bot className="w-5 h-5 text-teal-400" />
              <span>Live Agent Messages</span>
            </h3>

            <AgentMessage
              sender="JalNyay AI Mediator"
              role="mediator"
              text={mediation?.mediator_message || "Greetings. Initial proposal generated based on urgency and historical fairness."}
            />

            {!isRenegotiated ? (
              <>
                <AgentMessage
                  sender="Farmer A Agent"
                  role="farmer"
                  text="🤖 Proposal accepted! Allocated 3,600 L within my negotiation boundaries."
                />
                <AgentMessage
                  sender="Farmer B Agent"
                  role="farmer"
                  text="⚠️ Raising objection! 'I cannot irrigate after 2 PM because workers are unavailable.'"
                />
                <AgentMessage
                  sender="Farmer C Agent"
                  role="farmer"
                  text="🤖 Proposal accepted! Critical sugarcane crop priority satisfied."
                />
              </>
            ) : (
              <>
                <AgentMessage
                  sender="JalNyay AI Mediator"
                  role="mediator"
                  text={mediation?.revised_data?.mediator_renegotiation_message || "Processing objection from Farmer B. Adding hard time constraint..."}
                />
                <AgentMessage
                  sender="Farmer A Agent"
                  role="farmer"
                  text="🤖 Revised proposal accepted! Time window adjusted to accommodate Farmer B's labor constraint."
                />
                <AgentMessage
                  sender="Farmer B Agent"
                  role="farmer"
                  text="🤖 Revised proposal accepted! Delivery window now ends at 11:30 AM (before 2 PM)."
                />
                <AgentMessage
                  sender="JalNyay AI Mediator"
                  role="mediator"
                  text={mediation?.revised_data?.mediator_consensus_message || "Consensus reached! Binding agreement finalized."}
                />
              </>
            )}
          </div>

          <NegotiationTimeline events={auditEvents} />
        </div>
      </div>
    </div>
  );
};
