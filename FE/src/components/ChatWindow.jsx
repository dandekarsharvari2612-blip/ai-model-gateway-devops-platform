import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Cpu, 
  Clock, 
  Database, 
  GitCompare, 
  Layers, 
  ArrowRight,
  Terminal,
  ShieldCheck,
  Zap,
  SlidersHorizontal
} from 'lucide-react';

export default function ChatWindow({
  session,
  messages,
  onSendMessage,
  loading,
  selectedModel,
  onOpenModelModal,
  enableComparison,
  setEnableComparison
}) {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Auto-resize textarea
  const handleInputResize = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const samplePrompts = [
    {
      title: "Deploy 3-Tier App on Azure AKS",
      prompt: "How do I configure a 3-tier architecture with React Frontend, FastAPI Backend, and PostgreSQL on Azure AKS?",
      icon: Layers,
      color: "from-indigo-500/20 to-indigo-700/20 border-indigo-500/30 text-indigo-400"
    },
    {
      title: "Setup CI/CD Master & Runner Nodes",
      prompt: "Explain how to set up self-hosted GitHub Actions Master-Node and Worker Runner nodes for container builds.",
      icon: Terminal,
      color: "from-cyan-500/20 to-cyan-700/20 border-cyan-500/30 text-cyan-400"
    },
    {
      title: "Azure Database for PostgreSQL Config",
      prompt: "What are the best practices for connecting AKS pods to Azure Database for PostgreSQL with SSL and PgBouncer?",
      icon: Database,
      color: "from-emerald-500/20 to-emerald-700/20 border-emerald-500/30 text-emerald-400"
    },
    {
      title: "Run Historical Database Comparison",
      prompt: "Compare incoming production AKS specifications against historical database records to check for duplicates.",
      icon: GitCompare,
      color: "from-purple-500/20 to-purple-700/20 border-purple-500/30 text-purple-400"
    }
  ];

  // Helper to render formatted Markdown text and code blocks cleanly
  const renderFormattedContent = (content) => {
    // Check if contains code blocks
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: content.substring(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'bash',
        value: match[2]
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex)
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-lg">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                {part.language}
              </span>
              <button
                onClick={() => handleCopy(part.value, `code-${index}`)}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors"
              >
                {copiedIndex === `code-${index}` ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </span>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed">
              <code>{part.value}</code>
            </pre>
          </div>
        );
      } else {
        return (
          <div key={index} className="prose-chat whitespace-pre-wrap text-sm leading-relaxed">
            {part.value}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden relative">
      {/* Top Session & Model Information Bar */}
      <div className="h-12 border-b border-slate-800/80 bg-slate-900/40 px-4 lg:px-6 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400">Active Thread:</span>
          <span className="font-semibold text-slate-200 truncate">
            {session?.title || 'New AI Consultation'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300 font-mono text-[11px]">{selectedModel?.name}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>~{selectedModel?.latency_ms || 110}ms</span>
          </div>

          <button
            onClick={onOpenModelModal}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Model Parameters & Modules"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-10">
            {/* Hero Banner */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-cyan-500/20 border border-indigo-500/30 mb-4 shadow-xl shadow-indigo-500/10">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold font-heading gradient-text mb-2">
                Enterprise AI Model Gateway
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                3-Tier Architecture with Modular In-House AI Models, Azure PostgreSQL Persistence, and Real-Time Historical Data Comparison.
              </p>
            </div>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {samplePrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(item.prompt);
                    }}
                    className={`p-4 rounded-xl text-left bg-gradient-to-br ${item.color} border hover:border-indigo-400/60 transition-all transform hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between group`}
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm mb-1">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.prompt}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 mt-3 group-hover:translate-x-1 transition-transform">
                      <span>Explore workflow</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              const comparisonMeta = msg.comparison_meta;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-3.5 animate-slide-up ${
                    isAssistant ? 'items-start' : 'items-start justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/30">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-4 rounded-2xl shadow-md ${
                        isAssistant
                          ? 'bg-slate-900/90 border border-slate-800 text-slate-100'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-normal'
                      }`}
                    >
                      {/* Database Comparison Indicator if present */}
                      {isAssistant && comparisonMeta && comparisonMeta.matches_found > 0 && (
                        <div className="mb-3 px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>
                            Cross-referenced with <strong>{comparisonMeta.matches_found} record(s)</strong> in Azure PostgreSQL DB (Highest Match: <strong>{comparisonMeta.highest_similarity}%</strong>)
                          </span>
                        </div>
                      )}

                      {/* Main Message Content */}
                      {renderFormattedContent(msg.content)}
                    </div>

                    {/* Message Metadata Footer */}
                    <div className="flex items-center gap-2 mt-1.5 px-1 text-[10px] text-slate-500 font-mono">
                      <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isAssistant && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{msg.model_id || selectedModel?.id}</span>
                          {msg.latency_ms > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400">{msg.latency_ms}ms</span>
                            </>
                          )}
                          <button
                            onClick={() => handleCopy(msg.content, `msg-${idx}`)}
                            className="hover:text-slate-300 ml-1 p-0.5"
                            title="Copy message"
                          >
                            {copiedIndex === `msg-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3.5 items-start animate-pulse max-w-4xl mx-auto">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-slate-400 text-xs flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                  <span>Querying {selectedModel?.name} & comparing with PostgreSQL database records...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto">
          {/* Options Bar above input */}
          <div className="flex items-center justify-between mb-2 px-1 text-xs">
            <button
              type="button"
              onClick={() => setEnableComparison(!enableComparison)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                enableComparison
                  ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className={`w-3 h-3 ${enableComparison ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>Real-time DB Comparison: <strong>{enableComparison ? 'ON' : 'OFF'}</strong></span>
            </button>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline
            </span>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <div className="flex-1 relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-inner">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputResize}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${selectedModel?.name || 'AI Assistant'} about DevOps, Kubernetes, or query the database...`}
                rows={1}
                className="w-full pl-4 pr-12 py-3 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none max-h-44 min-h-[48px]"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-lg ${
                input.trim() && !loading
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95'
                  : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
