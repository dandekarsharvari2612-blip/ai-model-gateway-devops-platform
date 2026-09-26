import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  Database, 
  Clock, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  currentUser,
  loading,
  isOpen,
  onToggle
}) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className={`w-72 lg:w-80 h-[calc(100vh-4rem)] bg-slate-950/95 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 shrink-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* New Session Button */}
      <div className="p-4 border-b border-slate-800/80">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Consultation</span>
        </button>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search database history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Session History List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400" />
            Database Chat History
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-indigo-400 border border-slate-800">
            {filteredSessions.length}
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
            Loading sessions from database...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-8 px-4 text-center text-xs text-slate-500">
            {searchTerm ? 'No matching historical sessions.' : 'No sessions found in database. Start a new conversation!'}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate text-slate-200">
                      {session.title}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{new Date(session.updated_at || session.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span className="truncate">{session.model_id?.split('-')[1] || 'model'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-all ml-1"
                  title="Delete from database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Database Status & User Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800/60 mb-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Azure DB Status</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Synced
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 py-1 text-xs">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 uppercase">
            {currentUser?.username?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-200 truncate">{currentUser?.full_name || currentUser?.username}</div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser?.role || 'DevOps Engineer'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
