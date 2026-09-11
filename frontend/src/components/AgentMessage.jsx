import React from 'react';
import { Bot, User, AlertOctagon } from 'lucide-react';

export const AgentMessage = ({ sender, role = 'mediator', text, timestamp }) => {
  const isMediator = role === 'mediator';

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isMediator ? '' : 'pl-4'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
        isMediator
          ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-slate-950 font-bold'
          : 'bg-slate-700 text-teal-400 border border-slate-600'
      }`}>
        {isMediator ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      <div className={`flex-1 p-3.5 rounded-2xl border text-xs leading-relaxed ${
        isMediator
          ? 'bg-slate-800/95 border-teal-500/30 text-slate-200 shadow-md'
          : 'bg-slate-900/90 border-slate-700 text-slate-300'
      }`}>
        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/40">
          <span className={`font-bold ${isMediator ? 'text-teal-400' : 'text-cyan-300'}`}>
            {sender}
          </span>
          <span className="text-[10px] text-slate-500">{timestamp || '10:02 AM'}</span>
        </div>
        <p className="whitespace-pre-line text-slate-200">{text}</p>
      </div>
    </div>
  );
};
