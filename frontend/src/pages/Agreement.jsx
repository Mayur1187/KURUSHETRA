import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AgreementSummary } from '../components/AgreementSummary';
import { NegotiationTimeline } from '../components/NegotiationTimeline';
import { FileCheck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Agreement = () => {
  const navigate = useNavigate();
  const { activeAgreement, activeMediation } = useApp();
  const [agreement, setAgreement] = useState(activeAgreement);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const negId = activeMediation?.negotiation_id || 'neg-1';
      const res = await api.getAgreement(negId);
      if (res.success) {
        setAgreement(res.agreement);
      }
      const logsRes = await api.getAuditLogs(negId);
      if (logsRes.success) {
        setAuditLogs(logsRes.audit_logs);
      }
    };
    load();
  }, [activeMediation]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/negotiation-room')}
          className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Negotiation Room</span>
        </button>

        <span className="text-xs text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30 font-bold">
          Immutable Audit Record
        </span>
      </div>

      {agreement ? (
        <AgreementSummary agreement={agreement} />
      ) : (
        <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl text-center text-slate-400">
          <FileCheck className="w-12 h-12 text-teal-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Final Agreement Available Yet</h3>
          <p className="text-xs text-slate-400 mt-1">Complete a mediation negotiation round to view the binding agreement contract.</p>
        </div>
      )}

      {auditLogs.length > 0 && (
        <NegotiationTimeline events={auditLogs} />
      )}
    </div>
  );
};
