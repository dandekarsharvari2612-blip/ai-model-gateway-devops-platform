import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ComparisonView from './components/ComparisonView';
import ClusterStatusView from './components/ClusterStatusView';
import ModelSelectorModal from './components/ModelSelectorModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'comparison' | 'cluster'
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [temperature, setTemperature] = useState(0.7);
  const [enableComparison, setEnableComparison] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemStats, setSystemStats] = useState(null);

  // Initial Data Bootstrap
  useEffect(() => {
    async function bootstrap() {
      try {
        // 1. Fetch Users
        const usersList = await api.getUsers().catch(() => [
          { username: 'devops_lead', full_name: 'DevOps Lead Engineer', role: 'Principal DevOps' },
          { username: 'cloud_architect', full_name: 'Cloud Solution Architect', role: 'Infrastructure Architect' }
        ]);
        setUsers(usersList);
        const defaultUser = usersList[0] || { username: 'devops_lead', full_name: 'DevOps Lead Engineer', role: 'DevOps Engineer' };
        setCurrentUser(defaultUser);

        // 2. Fetch Models
        const modelsList = await api.getModels().catch(() => []);
        setModels(modelsList);
        if (modelsList.length > 0) {
          setSelectedModel(modelsList[0]);
        }

        // 3. Fetch Sessions for default user
        await loadUserSessions(defaultUser.username);

        // 4. Fetch Stats
        const stats = await api.getStats().catch(() => null);
        setSystemStats(stats);
      } catch (err) {
        console.error('Bootstrap error:', err);
      }
    }
    bootstrap();
  }, []);

  // Load Sessions for a User from the PostgreSQL Database
  const loadUserSessions = async (username) => {
    try {
      setLoadingSessions(true);
      const list = await api.getSessions(username);
      setSessions(list);
      if (list.length > 0) {
        await selectSession(list[0].id);
      } else {
        setActiveSessionId(null);
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load user sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Switch User Account (demonstrates database multi-user retrieval)
  const handleSwitchUser = async (user) => {
    setCurrentUser(user);
    await loadUserSessions(user.username);
  };

  // Select a Chat Session and load its full historical messages from DB
  const selectSession = async (sessionId) => {
    try {
      setActiveSessionId(sessionId);
      const detail = await api.getSessionHistory(sessionId);
      setCurrentSession(detail);
      setMessages(detail.messages || []);
      
      // Update model if session specified one
      if (detail.model_id && models.length > 0) {
        const matchingModel = models.find(m => m.id === detail.model_id);
        if (matchingModel) setSelectedModel(matchingModel);
      }
    } catch (err) {
      console.error('Failed to fetch session detail:', err);
    }
  };

  // Create a New Chat Session
  const handleNewSession = async () => {
    try {
      setActiveSessionId(null);
      setCurrentSession(null);
      setMessages([]);
      setActiveTab('chat');
    } catch (err) {
      console.error('Failed to create new session:', err);
    }
  };

  // Delete a Chat Session
  const handleDeleteSession = async (sessionId) => {
    try {
      await api.deleteSession(sessionId);
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          selectSession(updated[0].id);
        } else {
          handleNewSession();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // Send Message Flow
  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    // Temporary optimistic user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: content,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setChatLoading(true);

    try {
      const response = await api.sendMessage({
        content: content,
        session_id: activeSessionId || undefined,
        username: currentUser?.username || 'devops_lead',
        model_id: selectedModel?.id || 'inhouse-llama3-enterprise',
        enable_comparison: enableComparison,
        temperature: temperature
      });

      // Update active session if it was a new session
      if (!activeSessionId || activeSessionId !== response.session_id) {
        setActiveSessionId(response.session_id);
      }

      // Replace with persisted database messages
      const updatedDetail = await api.getSessionHistory(response.session_id);
      setCurrentSession(updatedDetail);
      setMessages(updatedDetail.messages || []);

      // Refresh session sidebar
      const updatedSessions = await api.getSessions(currentUser?.username);
      setSessions(updatedSessions);
    } catch (err) {
      console.error('Error sending message:', err);
      // Add error message in chat
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Connection Error**: Failed to receive response from AI backend. Please verify your backend server and database connection.\n\n*Details: ${err.message}*`,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        selectedModel={selectedModel}
        models={models}
        onSelectModel={setSelectedModel}
        onOpenModelModal={() => setModelModalOpen(true)}
        systemStats={systemStats}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Only visible on Chat Tab) */}
        {activeTab === 'chat' && (
          <Sidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={selectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            currentUser={currentUser}
            loading={loadingSessions}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Dynamic Views */}
        {activeTab === 'chat' && (
          <ChatWindow
            session={currentSession}
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={chatLoading}
            selectedModel={selectedModel}
            onOpenModelModal={() => setModelModalOpen(true)}
            enableComparison={enableComparison}
            setEnableComparison={setEnableComparison}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonView currentUser={currentUser} />
        )}

        {activeTab === 'cluster' && (
          <ClusterStatusView />
        )}
      </div>

      {/* Model Parameter & Module Modal */}
      <ModelSelectorModal
        isOpen={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={(m) => {
          setSelectedModel(m);
          setModelModalOpen(false);
        }}
        temperature={temperature}
        setTemperature={setTemperature}
      />
    </div>
  );
}
