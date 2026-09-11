import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, User, Lock, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, quickLogin, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (preset) => {
    setLoading(true);
    await quickLogin(preset);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-xl shadow-cyan-500/20 text-slate-950 font-bold">
          <Droplet className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent">
          Sign In to JalSangam AI
        </h2>
        <p className="text-xs text-slate-400">Autonomous Water Sharing Dispute Mediation Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {(loginError || error) && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="farmer@jalsangam.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition"
            >
              <span>SIGN IN TO PLATFORM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Quick-Login Section */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Hackathon Demo Logins</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer-a')}
                className="bg-slate-800 hover:bg-slate-700/80 p-2.5 rounded-xl border border-slate-700 text-left text-slate-300 transition flex flex-col"
              >
                <span className="font-bold text-white text-[11px]">🌾 Farmer A (Ramesh)</span>
                <span className="text-[10px] text-slate-400">Wheat • Urgency 4</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('farmer-b')}
                className="bg-slate-800 hover:bg-slate-700/80 p-2.5 rounded-xl border border-slate-700 text-left text-slate-300 transition flex flex-col"
              >
                <span className="font-bold text-white text-[11px]">🌾 Farmer B (Suresh)</span>
                <span className="text-[10px] text-slate-400">Vegetables • Morning</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('farmer-c')}
                className="bg-slate-800 hover:bg-slate-700/80 p-2.5 rounded-xl border border-slate-700 text-left text-slate-300 transition flex flex-col"
              >
                <span className="font-bold text-white text-[11px]">🌾 Farmer C (Mahesh)</span>
                <span className="text-[10px] text-slate-400">Sugarcane • High Stress</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('authority')}
                className="bg-slate-800 hover:bg-slate-700/80 p-2.5 rounded-xl border border-slate-700 text-left text-slate-300 transition flex flex-col"
              >
                <span className="font-bold text-cyan-300 text-[11px]">💧 Water Authority</span>
                <span className="text-[10px] text-slate-400">Canal Supply Control</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDemoLogin('mediator')}
              className="w-full mt-2 bg-gradient-to-r from-teal-950 to-cyan-950 hover:from-teal-900 hover:to-cyan-900 border border-teal-500/30 p-2.5 rounded-xl text-xs text-teal-300 font-bold transition flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Login as JalNyay AI Mediator Admin</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-bold text-teal-400 hover:text-teal-300">
              Create User Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
