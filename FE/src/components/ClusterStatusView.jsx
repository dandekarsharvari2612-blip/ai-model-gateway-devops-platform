import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Server, 
  Database, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive, 
  Network, 
  RefreshCw,
  Zap,
  Terminal,
  GitPullRequest
} from 'lucide-react';
import { api } from '../services/api';

export default function ClusterStatusView() {
  const [stats, setStats] = useState(null);
  const [readyStatus, setReadyStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const [sData, rData] = await Promise.all([
        api.getStats().catch(() => null),
        api.checkReady().catch(() => ({ status: 'offline', database: 'disconnected' }))
      ]);
      setStats(sData);
      setReadyStatus(rData);
    } catch (err) {
      console.error('Failed to fetch cluster health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-950 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold font-heading text-slate-100">
                3-Tier Cloud Architecture & AKS Telemetry
              </h1>
            </div>
            <p className="text-xs lg:text-sm text-slate-400">
              Live topology and operational status across Frontend (Tier 1), AKS AI Gateway (Tier 2), and Database (Tier 3).
            </p>
          </div>

          <button
            onClick={fetchHealth}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium self-start sm:self-auto transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh Telemetry
          </button>
        </div>

        {/* 3-Tier Visual Flow Architecture */}
        <div className="glass-panel-glow rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2 font-heading">
            <Layers className="w-4 h-4 text-indigo-400" />
            End-to-End Three-Tier Topology Flow
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Tier 1: Frontend */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  TIER 1 • FRONTEND
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-slate-100 text-sm">React Chat SPA</h3>
                <p className="text-xs text-slate-400 mt-0.5">Nginx Ingress • Port 80/443</p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between"><span>Deployment:</span> <span className="text-slate-200">ai-frontend</span></div>
                <div className="flex justify-between"><span>Host:</span> <span className="text-slate-200">Vite / Nginx</span></div>
                <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-400">Serving Traffic</span></div>
              </div>
            </div>

            {/* Tier 2: Backend */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  TIER 2 • BACKEND
                </span>
                <span className={`w-2 h-2 rounded-full ${readyStatus?.status === 'ready' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'}`}></span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-slate-100 text-sm">FastAPI AI Model Gateway</h3>
                <p className="text-xs text-slate-400 mt-0.5">Azure AKS Cluster • Port 8000</p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between"><span>Models Active:</span> <span className="text-slate-200">{stats?.active_models_count || 5}</span></div>
                <div className="flex justify-between"><span>HPA AutoScale:</span> <span className="text-slate-200">2 - 10 Pods</span></div>
                <div className="flex justify-between"><span>Probes:</span> <span className="text-emerald-400">/ready & /live OK</span></div>
              </div>
            </div>

            {/* Tier 3: Database */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  TIER 3 • DATABASE
                </span>
                <span className={`w-2 h-2 rounded-full ${readyStatus?.database === 'connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-red-400'}`}></span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-slate-100 text-sm">Azure PostgreSQL RDS</h3>
                <p className="text-xs text-slate-400 mt-0.5">VNet Private Endpoint • Port 5432</p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between"><span>Stored Sessions:</span> <span className="text-slate-200">{stats?.total_sessions ?? 0}</span></div>
                <div className="flex justify-between"><span>Persisted Msgs:</span> <span className="text-slate-200">{stats?.total_messages ?? 0}</span></div>
                <div className="flex justify-between"><span>Knowledge Records:</span> <span className="text-slate-200">{stats?.total_knowledge_records ?? 0}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Node & Runner Node Infrastructure Topology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Master Controller Node */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <h3 className="font-heading font-semibold text-sm text-slate-200">
                  Master Controller Node (CI/CD Orchestrator)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Primary Master
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coordinates pipeline webhooks, secret rotation, runner token generation, and cluster scheduling.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono space-y-1.5 border border-slate-800">
              <div className="flex justify-between"><span className="text-slate-500">Controller:</span> <span className="text-slate-300">Actions Runner Controller (ARC)</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Namespace:</span> <span className="text-slate-300">actions-runner-system</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Queue State:</span> <span className="text-emerald-400">Listening (0 queued)</span></div>
            </div>
          </div>

          {/* Worker Runner Nodes */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-heading font-semibold text-sm text-slate-200">
                  Worker Runner Nodes (Self-Hosted Workers)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Auto-Scale Pool
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ephemeral execution nodes with Docker-in-Docker support for testing, building container images, and deploying Helm charts.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono space-y-1.5 border border-slate-800">
              <div className="flex justify-between"><span className="text-slate-500">Node Labels:</span> <span className="text-slate-300">self-hosted, aks-runner, dind</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Build Engine:</span> <span className="text-slate-300">Docker 24.x + Podman</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Node Status:</span> <span className="text-emerald-400">Idle & Ready</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
