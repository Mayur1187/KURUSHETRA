import React from 'react';
import { Droplet, ShieldCheck, RefreshCw, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const { handleResetSystem, loading } = useApp();
  const { user, logout, isAuthenticated } = useAuth();

  const roleBadges = {
    farmer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    authority: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    mediator: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Droplet className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent">
              JalSangam AI
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 font-medium">
              Autonomous Mediator
            </span>
          </div>
          <p className="text-xs text-slate-400">Fair Irrigation Dispute Resolution Platform</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700">
            <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xs text-left hidden sm:block">
              <span className="font-bold text-white block leading-tight">{user.full_name}</span>
              <span className={`text-[10px] font-semibold uppercase ${roleBadges[user.role] || roleBadges.farmer}`}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleResetSystem}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition"
          title="Reset environment to default demo state"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Reset Demo</span>
        </button>

        {isAuthenticated && (
          <button
            onClick={handleLogoutClick}
            className="flex items-center space-x-1.5 text-xs bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 px-3 py-2 rounded-lg border border-rose-600/40 transition font-bold"
            title="Sign out of platform"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
