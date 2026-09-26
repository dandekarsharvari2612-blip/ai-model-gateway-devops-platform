import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Database, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Sparkles, 
  Layers, 
  ArrowRight,
  FileText,
  Tag,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

export default function ComparisonView({ currentUser }) {
  const [inputText, setInputText] = useState('');
  const [threshold, setThreshold] = useState(0.25);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('DevOps/Infra');
  const [newContent, setNewContent] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Load existing database records
  const loadRecords = async () => {
    try {
      setRecordsLoading(true);
      const data = await api.getKnowledgeRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load database records:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleRunComparison = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    try {
      setLoading(true);
      const res = await api.compareData({
        input_text: inputText.trim(),
        threshold: parseFloat(threshold),
        limit: 5
      });
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Comparison failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      await api.createKnowledgeRecord({
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim(),
        created_by: currentUser?.username || 'devops_lead',
        tags: [newCategory.toLowerCase(), 'custom-record']
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
      setStatusMessage({ type: 'success', text: 'New record persisted to Azure PostgreSQL database!' });
      setTimeout(() => setStatusMessage(null), 4000);
      loadRecords();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save record' });
    }
  };

  const presetSamples = [
    {
      title: "Sample 1: AKS Overlay Networking (Near Match)",
      text: "Standard Production AKS cluster configuration requires Azure CNI Overlay networking and private cluster endpoints."
    },
    {
      title: "Sample 2: CI/CD Ephemeral Runners (Related Match)",
      text: "We need to setup GitHub Actions self-hosted master-node and runner worker nodes for docker-in-docker builds."
    },
    {
      title: "Sample 3: Novel Quantum Algorithm (Zero Match)",
      text: "Implement Shor's prime factorization algorithm on a 128-qubit superconducting quantum processor."
    }
  ];

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-950 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <GitCompare className="w-5 h-5" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold font-heading text-slate-100">
                Database Comparison & Deduplication Engine
              </h1>
            </div>
            <p className="text-xs lg:text-sm text-slate-400">
              Validates new incoming data, configurations, or prompts against historical records stored in Azure PostgreSQL/RDS.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add DB Knowledge Record
          </button>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300' 
              : 'bg-red-950/70 border border-red-500/30 text-red-300'
          }`}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Input & Comparison Testing Card */}
        <div className="glass-panel rounded-2xl p-5 lg:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 font-heading">
            <Search className="w-4 h-4 text-cyan-400" />
            Test Incoming Data Comparison
          </h2>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] text-slate-500 self-center">Try Preset:</span>
            {presetSamples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(s.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors"
              >
                {s.title}
              </button>
            ))}
          </div>

          <form onSubmit={handleRunComparison} className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type new incoming text, Kubernetes manifest, architectural spec, or prompt to compare with the database..."
              rows={4}
              className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Match Sensitivity Threshold:</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="accent-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-indigo-400">{Math.round(threshold * 100)}%</span>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scanning Database Records...</span>
                  </>
                ) : (
                  <>
                    <GitCompare className="w-4 h-4" />
                    <span>Run Database Comparison</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Comparison Results Section */}
        {comparisonResult && (
          <div className="glass-panel-glow rounded-2xl p-5 lg:p-6 space-y-4 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${
                  comparisonResult.highest_similarity >= 75 ? 'bg-amber-400 animate-ping' :
                  comparisonResult.highest_similarity >= 35 ? 'bg-cyan-400' : 'bg-emerald-400'
                }`}></div>
                <h3 className="font-heading font-semibold text-slate-100 text-sm">
                  Comparison Verdict: {comparisonResult.highest_similarity >= 75 ? 'High Overlap / Duplicate Alert' : 
                                      comparisonResult.highest_similarity >= 35 ? 'Related Historical Context Found' : 'Novel Unique Content'}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Checked:</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  {comparisonResult.total_db_records_checked} DB records
                </span>
                <span className="text-slate-400 ml-2">Highest Score:</span>
                <span className={`px-2 py-0.5 rounded font-bold border ${
                  comparisonResult.highest_similarity >= 75 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  comparisonResult.highest_similarity >= 35 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {comparisonResult.highest_similarity}%
                </span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">AI Engine Recommendation:</strong> {comparisonResult.recommendation}
              </div>
            </div>

            {/* Matched Records List */}
            {comparisonResult.matches.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ranked Database Matches ({comparisonResult.matches.length})
                </div>

                {comparisonResult.matches.map((match, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-200">{match.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                            {match.category}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {match.source_type}
                          </span>
                        </div>
                      </div>

                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                        match.similarity_score >= 75 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {match.similarity_score}% Match
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg font-mono border border-slate-800/80">
                      {match.historical_content}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">Diff Analysis:</span>
                      <span>{match.diff_summary}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                No historical records exceeded the {Math.round(threshold * 100)}% threshold. This input is treated as completely fresh data.
              </div>
            )}
          </div>
        )}

        {/* Database Knowledge Explorer Table */}
        <div className="glass-panel rounded-2xl p-5 lg:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 font-heading">
              <Database className="w-4 h-4 text-emerald-400" />
              Persisted Database Knowledge Base ({records.length})
            </h2>
            <button
              onClick={loadRecords}
              className="text-xs text-indigo-400 hover:underline"
            >
              Refresh DB Records
            </button>
          </div>

          {recordsLoading ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Loading knowledge records from Azure PostgreSQL...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {records.map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-200">{rec.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 shrink-0">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {rec.content}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                    <span>Version: {rec.version}</span>
                    <span>Created by: {rec.created_by}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Add Knowledge Baseline to Database
            </h3>

            <form onSubmit={handleAddRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Record Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AKS Network Security Group Policy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Kubernetes/AKS">Kubernetes/AKS</option>
                  <option value="Database/RDS">Database/RDS</option>
                  <option value="DevOps/CI-CD">DevOps/CI-CD</option>
                  <option value="Cloud Security">Cloud Security</option>
                  <option value="Architecture">Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Knowledge Content / Specification</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste verified architecture specification or configuration standard..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
