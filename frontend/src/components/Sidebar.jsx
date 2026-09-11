import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Droplets, 
  AlertTriangle, 
  Bot, 
  FileCheck,
  Home,
  Sprout
} from 'lucide-react';

export const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const navItems = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/agri-evidence', label: 'AgriEvidence', icon: Sprout, badge: 'AI Vision' },
    { to: '/farmers', label: 'Farmers', icon: Users },
    { to: '/water-management', label: 'Water Resource', icon: Droplets },
    { to: '/conflict-center', label: 'Conflict Center', icon: AlertTriangle },
    { to: '/negotiation-room', label: 'Negotiation Room', icon: Bot, badge: 'Live AI' },
    { to: '/agreement', label: 'Agreements & Audit', icon: FileCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 min-h-[calc(100vh-65px)] p-4">
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
