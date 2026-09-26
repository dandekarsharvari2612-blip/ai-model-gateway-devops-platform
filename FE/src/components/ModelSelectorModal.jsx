import React from 'react';
import { 
  X, 
  Cpu, 
  Check, 
  Zap, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Sliders,
  Database
} from 'lucide-react';

export default function ModelSelectorModal({
  isOpen,
  onClose,
  models,
  selectedModel,
  onSelectModel,
  temperature,
  setTemperature
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-100 text-base">
                Modular AI Engine & Parameter Registry
              </h3>
              <p className="text-xs text-slate-400">
                Select from specialized in-house neural models or connected cloud providers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Temperature Slider */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Inference Temperature (Creativity vs Determinism)
              </span>
              <span className="font-mono font-bold text-indigo-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.1 (Precise / Code)</span>
              <span>0.7 (Balanced)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          {/* Model Cards Grid */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Available AI Modules ({models.length})
            </div>

            {models.map((m) => {
              const isSelected = selectedModel?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectModel(m)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-sm text-slate-100">
                          {m.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                          {m.provider}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                          {m.parameters_count}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {m.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        {m.latency_ms}ms
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Capabilities Tags */}
                  {m.capabilities && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                      {m.capabilities.map((cap, cIdx) => (
                        <span key={cIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          #{cap}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
