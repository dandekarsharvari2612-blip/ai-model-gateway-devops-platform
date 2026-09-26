import React from 'react';
import { 
  Cpu, 
  Database, 
  Server, 
  GitBranch, 
  Layers, 
  Sparkles, 
  UserCircle, 
  ChevronDown,
  Activity,
  Sliders
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onSwitchUser,
  selectedModel,
  models,
  onSelectModel,
  onOpenModelModal,
  systemStats
}) {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = React.useState(false);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & 3-Tier Architecture Badge */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-lg tracking-tight gradient-text">NexusAI</span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              3-Tier AKS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Modular Model Gateway • DB Persistence • AKS Ingress
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Chatbot
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'comparison'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          DB Data Comparison
        </button>

        <button
          onClick={() => setActiveTab('cluster')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'cluster'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Cluster & Architecture
        </button>
      </div>

      {/* Right Controls: Model Selector & User Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Active Model Module Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="max-w-[120px] sm:max-w-[160px] truncate font-medium">
              {selectedModel?.name || 'Select Model'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-slide-up">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active Model Module</span>
                <button 
                  onClick={() => { setModelDropdownOpen(false); onOpenModelModal(); }}
                  className="text-indigo-400 hover:underline flex items-center gap-1 normal-case font-normal"
                >
                  <Sliders className="w-3 h-3" /> View All
                </button>
              </div>
              <div className="space-y-1 mt-1">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                      selectedModel?.id === m.id
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.provider} • {m.parameters_count}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {m.latency_ms}ms
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account Switcher (Demonstrates Multi-Tenant DB Persistence) */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {currentUser?.username?.charAt(0) || 'U'}
            </div>
            <span className="hidden sm:inline font-medium text-slate-300">
              {currentUser?.username || 'devops_lead'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-slide-up">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Team Account (DB Session)
              </div>
              <div className="space-y-1 mt-1">
                {users.map((u) => (
                  <button
                    key={u.id || u.username}
                    onClick={() => {
                      onSwitchUser(u);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      currentUser?.username === u.username
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">{u.full_name || u.username}</div>
                      <div className="text-[10px] text-slate-400">{u.role}</div>
                    </div>
                    {currentUser?.username === u.username && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
