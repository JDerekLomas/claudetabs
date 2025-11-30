import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Loader2,
  Menu,
  Plus,
  Settings,
  Save,
  Keyboard,
  Search
} from 'lucide-react';

// --- Design System Constants ---
const COLORS = {
  bg: '#F4F4F2',
  text: '#2D2D2A',
  accent: '#D97757',
  accentHover: '#C06345',
  secondary: '#E8E6E1',
  highlight: 'rgba(217, 119, 87, 0.15)',
  highlightBorder: 'rgba(217, 119, 87, 0.4)',
  surface: '#FFFFFF',
  sidebar: '#F2F0EB'
};

const FONTS = {
  serif: 'font-serif',
  sans: 'font-sans',
};

// --- Helper: Text Parsing with Chips ---
const ContentWithChips = ({ text, onChipClick, isSerif = true }) => {
  if (!text) return null;
  const parts = text.split(/(%%.*?%%)/g);
  return (
    <span className={`leading-relaxed ${isSerif ? FONTS.serif : FONTS.sans}`}>
      {parts.map((part, i) => {
        if (part.startsWith('%%') && part.endsWith('%%')) {
          const content = part.slice(2, -2);
          return (
            <span
                key={i}
                onClick={(e) => { e.stopPropagation(); onChipClick(content); }}
                className="inline-block border-b-2 cursor-pointer transition-all duration-200 hover:bg-orange-100 mx-[1px] px-[2px] rounded-[2px]"
                style={{
                    borderColor: COLORS.highlightBorder,
                    backgroundColor: COLORS.highlight,
                }}
            >
                {content}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// --- Mock Data ---
const DEFAULT_PRELOADED_SUMMARIES = {
  "React Three Fiber": "A React renderer for Three.js.",
  "Cannon.js": "A lightweight 3D physics engine.",
  "Game Loop": "The central heartbeat of any game.",
  "Constructive Solid Geometry": "A modeling technique for 3D shapes."
};

const DEFAULT_CHAT = {
  id: 'chat-1',
  title: 'Help me build a marble run in three.js',
  messages: [
    {
      id: 1,
      role: 'user',
      text: "Help me build a marble run in three.js and start by explaining how it works and giving me link to satisfy my technical curiosity"
    },
    {
      id: 2,
      role: 'assistant',
      text: "I'll help you build a marble run in three.js! Let me start by explaining the physics and rendering architecture you'll need.\n\nFor a React-based approach, you should use %%React Three Fiber%% (R3F) to handle the 3D scene declaratively. For the physics simulation with gravity, collisions, and marble movement, we'll integrate %%Cannon.js%% which provides a robust rigid body physics engine.\n\nWe'll need a solid %%Game Loop%% that synchronizes the physics step with the render frame at 60fps. The track itself can be built using modular %%Constructive Solid Geometry%% techniques, making it easy to design complex paths procedurally."
    }
  ]
};

// --- Main Application ---
export default function ClaudeLearningPrototype() {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [learningModeOn, setLearningModeOn] = useState(true);

  // Selection State
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectedText, setSelectedText] = useState("");

  // User Profile State
  const [userProfile, setUserProfile] = useState("I am a React developer interested in Game Development and 3D Graphics. I prefer practical examples over pure theory.");

  // Chat Data State
  const [messages, setMessages] = useState(DEFAULT_CHAT.messages);
  const [chatHistory, setChatHistory] = useState([
    { id: 'chat-1', title: 'Help me build a marble run in three.js' },
    { id: 'chat-2', title: 'Understanding Redux Middleware' },
    { id: 'chat-3', title: 'CSS Grid Layouts' }
  ]);

  // Input State
  const [inputText, setInputText] = useState("");
  const [sideInputText, setSideInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Tab State
  const [tabs, setTabs] = useState([{ id: 'main', title: 'Help me build a marble run in three.js', type: 'chat', content: null }]);
  const [activeTabId, setActiveTabId] = useState('main');

  // Dynamic Summaries Cache
  const [conceptCache, setConceptCache] = useState(DEFAULT_PRELOADED_SUMMARIES);

  // --- Keyboard Shortcuts Hook ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        switch(e.key) {
          case 'ArrowRight':
            e.preventDefault();
            navigateTab('next');
            break;
          case 'ArrowLeft':
            e.preventDefault();
            navigateTab('prev');
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSearchModalOpen(true);
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (activeTabId !== 'main') {
              closeTab(null, activeTabId);
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId]);

  const navigateTab = (direction) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTabId);
    let newIndex = currentIndex;

    if (direction === 'next') {
      newIndex = Math.min(tabs.length - 1, currentIndex + 1);
    } else {
      newIndex = Math.max(0, currentIndex - 1);
    }

    if (newIndex !== currentIndex) {
      setActiveTabId(tabs[newIndex].id);
    }
  };

  // --- Selection Handler ---
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelectionBox({
          top: rect.top - 40,
          left: rect.left + (rect.width / 2) - 50,
        });
        setSelectedText(selection.toString());
      } else {
        setSelectionBox(null);
        setSelectedText("");
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // --- API: Fetch Definition (Deep Dive) ---
  const fetchConceptData = async (term) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are explaining a technical concept in a side-bar.
Concept: "${term}"
User Profile: "${userProfile}"

CRITICAL INSTRUCTION:
Explain this concept clearly and concisely (2-3 paragraphs max).
Wrap 2-3 key related technical terms in your explanation with %%double percentage signs%% (e.g., %%WebGL%%) so they can be interactive.

At the end, list 2-3 related terms the user might want to explore next.

Format your response like this:
[Your explanation with %%highlighted terms%%]

RELATED: Term 1, Term 2, Term 3`
          }],
          model: 'claude-opus-4-20250514'
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
              }
            } catch (parseError) {
              // Ignore
            }
          }
        }
      }

      // Parse RELATED section
      const relatedMatch = fullText.match(/RELATED:\s*(.+)$/i);
      const related = relatedMatch
        ? relatedMatch[1].split(',').map(t => t.trim()).filter(t => t)
        : [];

      const explanation = relatedMatch
        ? fullText.substring(0, relatedMatch.index).trim()
        : fullText;

      return { explanation, related };
    } catch (error) {
      console.error("Claude API Error:", error);
      return {
        explanation: "We encountered an error connecting to Claude.",
        related: []
      };
    }
  };

  // --- API: Main Chat ---
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    if (activeTabId !== 'main') setActiveTabId('main');

    const isNewChat = messages.length === 0;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.text
          })).concat([{ role: 'user', content: inputText }]),
          model: 'claude-opus-4-20250514'
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let aiMsgId = Date.now() + 1;

      // Add placeholder message
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;

                // Update message in real-time
                setMessages(prev => prev.map(m =>
                  m.id === aiMsgId ? { ...m, text: fullText } : m
                ));
              }
            } catch (parseError) {
              // Ignore
            }
          }
        }
      }

      // Update tab title if new chat
      if (isNewChat && fullText) {
        const firstLine = inputText.split('\n')[0];
        const newTitle = firstLine.slice(0, 50) + (firstLine.length > 50 ? '...' : '');
        setTabs(prev => prev.map(t => t.id === 'main' ? { ...t, title: newTitle } : t));
        setChatHistory(prev => [{ id: `chat-${Date.now()}`, title: newTitle }, ...prev]);
      }

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: "Sorry, I couldn't connect to the server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- API: Side Chat ---
  const handleSideMessage = async (tabId) => {
    if (!sideInputText.trim()) return;

    const currentTab = tabs.find(t => t.id === tabId);
    if (!currentTab) return;

    const userMsg = { id: Date.now(), role: 'user', text: sideInputText };
    const updatedTabs = tabs.map(t => {
      if (t.id === tabId) {
        return {
          ...t,
          content: {
            ...t.content,
            messages: [...t.content.messages, userMsg]
          }
        };
      }
      return t;
    });
    setTabs(updatedTabs);
    setSideInputText("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentTab.content.messages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.text
          })).concat([{ role: 'user', content: sideInputText }]),
          model: 'claude-opus-4-20250514'
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let aiMsgId = Date.now() + 1;

      // Add placeholder
      setTabs(prev => prev.map(t => {
        if (t.id === tabId) {
          return {
            ...t,
            content: {
              ...t.content,
              messages: [...t.content.messages, { id: aiMsgId, role: 'ai', text: '' }]
            }
          };
        }
        return t;
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;

                setTabs(prev => prev.map(t => {
                  if (t.id === tabId) {
                    return {
                      ...t,
                      content: {
                        ...t.content,
                        messages: t.content.messages.map(m =>
                          m.id === aiMsgId ? { ...m, text: fullText } : m
                        )
                      }
                    };
                  }
                  return t;
                }));
              }
            } catch (parseError) {
              // Ignore
            }
          }
        }
      }

    } catch (error) {
      console.error(error);
    }
  };

  // --- Handlers ---
  const handleOpenTab = async (term) => {
    setSearchModalOpen(false);
    setSelectionBox(null);
    window.getSelection()?.removeAllRanges();

    const existingTab = tabs.find(t => t.title.toLowerCase() === term.toLowerCase());
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const preloadSummary = conceptCache[term] || `Exploring ${term}...`;

    const newTabId = `tab-${Date.now()}`;
    const newTab = {
      id: newTabId,
      title: term,
      type: 'learning',
      loading: true,
      content: {
        short: preloadSummary,
        messages: [],
        related: []
      }
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);

    const data = await fetchConceptData(term);

    setTabs(prev => prev.map(t => {
      if (t.id === newTabId) {
        return {
          ...t,
          loading: false,
          content: {
            ...t.content,
            messages: [{ id: 'init', role: 'ai', text: data.explanation }],
            related: data.related
          }
        };
      }
      return t;
    }));
  };

  const handleNewChat = () => {
    setMessages([]);
    setTabs([{ id: 'main', title: 'New Chat', type: 'chat', content: null }]);
    setActiveTabId('main');
    setSidebarOpen(false);
  };

  const closeTab = (e, tabId) => {
    if (e) e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  // --- Renderers ---
  const renderActiveTabContent = () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return null;

    if (activeTab.type === 'chat') {
      return (
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth relative">
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-[50vh] text-center text-gray-400">
                <Sparkles size={48} className="mb-4 opacity-20" />
                <p>Start a new conversation</p>
                <p className="text-xs mt-2 opacity-50 max-w-xs">{userProfile}</p>
                <div className="mt-8 flex items-center gap-4 text-xs bg-gray-100 p-3 rounded-lg opacity-60">
                    <Keyboard size={16} />
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><span className="font-bold">Opt</span>+<span className="font-bold">←/→</span> Nav</span>
                        <span className="flex items-center gap-1"><span className="font-bold">Opt</span>+<span className="font-bold">↑</span> New Tab</span>
                    </div>
                </div>
             </div>
          )}
          {messages.map((msg) => (
             <div key={msg.id} className={`mb-8 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 md:p-6 shadow-sm ${
                 msg.role === 'user' ? 'bg-[#EFECE6] text-[#424240]' : 'bg-white text-[#141413] border border-[#E6E4DD]'
               }`}>
                 <ContentWithChips
                    text={msg.text}
                    onChipClick={handleOpenTab}
                    isSerif={msg.role === 'ai'}
                 />
               </div>
             </div>
          ))}
          {isTyping && (
            <div className="flex justify-start mb-8">
               <div className="bg-white rounded-2xl p-4 border border-[#E6E4DD] flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" style={{ animationDelay: '75ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" style={{ animationDelay: '150ms' }} />
               </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right-10 duration-300">
        <div className="p-6 md:p-8 pb-4 border-b border-gray-100">
             <div className="flex items-center gap-2 text-[#D97757] text-xs font-bold tracking-wider uppercase mb-2">
                <Sparkles size={12} />
                Deep Dive
            </div>
            <h1 className={`text-3xl md:text-4xl ${FONTS.serif} text-[#141413] leading-tight`}>
                {activeTab.title}
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-serif italic border-l-2 border-[#D97757] pl-3">
                {activeTab.content?.short}
            </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {activeTab.loading ? (
                <div className="flex flex-col items-center py-10 opacity-70">
                    <Loader2 className="w-6 h-6 text-[#D97757] animate-spin mb-3" />
                    <p className="text-sm text-gray-400 font-sans uppercase tracking-widest">Generating Context...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {activeTab.content?.messages?.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[90%] rounded-xl p-4 ${
                                 msg.role === 'user'
                                 ? 'bg-[#EFECE6] text-[#424240] text-sm'
                                 : 'text-[#141413] text-lg leading-relaxed font-serif'
                             }`}>
                                {msg.role === 'ai' && idx !== 0 && (
                                     <div className="flex items-center gap-2 mb-2 opacity-30">
                                         <Sparkles size={12} /> <span className="text-xs uppercase font-sans tracking-widest">Answer</span>
                                     </div>
                                )}
                                <ContentWithChips text={msg.text} onChipClick={handleOpenTab} isSerif={msg.role === 'ai'} />
                             </div>
                        </div>
                    ))}

                    {activeTab.content?.related?.length > 0 && (
                         <div className="pl-4 mt-4">
                            <h4 className="font-sans font-bold text-xs text-gray-400 uppercase tracking-widest mb-3">Explore Related</h4>
                            <div className="flex flex-wrap gap-2">
                            {activeTab.content.related.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleOpenTab(item)}
                                    className="px-3 py-1.5 bg-white border border-[#E6E4DD] rounded-full text-xs font-medium text-gray-600 hover:border-[#D97757] hover:text-[#D97757] transition-colors"
                                >
                                    {item}
                                </button>
                            ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="p-4 border-t border-[#E6E4DD] bg-[#FAF9F6]">
            <div className="flex gap-2 items-center bg-white border border-[#D1D1D1] rounded-full px-4 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#D97757]">
                <input
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    placeholder={`Ask about ${activeTab.title}...`}
                    value={sideInputText}
                    onChange={(e) => setSideInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSideMessage(activeTab.id)}
                />
                <button
                    onClick={() => handleSideMessage(activeTab.id)}
                    disabled={!sideInputText.trim()}
                    className="p-1.5 bg-[#D97757] text-white rounded-full hover:bg-[#C06345] disabled:opacity-50"
                >
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-screen w-full flex overflow-hidden font-sans relative"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* Float Selection Menu */}
      {selectionBox && (
          <div
            className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
            style={{ top: selectionBox.top, left: selectionBox.left }}
          >
              <button
                onClick={() => handleOpenTab(selectedText)}
                className="bg-[#1C1C1A] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
              >
                  <Sparkles size={12} className="text-[#D97757]" />
                  Deep Dive "{selectedText.length > 15 ? selectedText.substring(0, 15) + '...' : selectedText}"
              </button>
          </div>
      )}

      {/* New Tab Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchModalOpen(false)} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-[#E6E4DD] bg-[#FAF9F6] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[#D97757] font-semibold text-sm uppercase tracking-wide">
                        <Plus size={16} /> New Learning Tab
                    </div>
                    <button onClick={() => setSearchModalOpen(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="p-8">
                    <h3 className={`text-2xl ${FONTS.serif} text-[#141413] mb-6`}>What do you want to learn about?</h3>
                    <div className="flex items-center gap-2 border-b-2 border-[#E6E4DD] focus-within:border-[#D97757] transition-colors pb-2">
                        <Search size={20} className="text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Docker Containers, useEffect..."
                            className="flex-1 text-lg outline-none text-[#141413] placeholder:text-gray-300"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    handleOpenTab(e.target.value);
                                }
                            }}
                        />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {["Three.js", "TypeScript", "React Hooks", "Vite"].map(term => (
                            <button key={term} onClick={() => handleOpenTab(term)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition-colors">
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[#E6E4DD] flex justify-between items-center bg-[#FAF9F6]">
                    <h3 className="font-serif text-xl font-bold text-[#141413]">Learning Profile</h3>
                    <button onClick={() => setSettingsOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Claude adapts its explanations and highlights based on your interests.
                    </p>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">My Interests</label>
                    <textarea
                        value={userProfile}
                        onChange={(e) => setUserProfile(e.target.value)}
                        className="w-full h-32 p-3 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] text-[#2D2D2A] focus:outline-none focus:ring-2 focus:ring-[#D97757] resize-none"
                    />
                </div>
                <div className="p-4 border-t border-[#E6E4DD] flex justify-end">
                    <button
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center gap-2 px-6 py-2 bg-[#D97757] hover:bg-[#C06345] text-white rounded-lg font-medium transition-colors"
                    >
                        <Save size={16} />
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
      )}

      {/* Sidebar */}
      <aside
        className={`
            fixed md:relative inset-y-0 left-0 z-50 w-72 bg-[#F2F0EB] border-r border-[#E6E4DD] transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'}
        `}
      >
        <div className="flex flex-col h-full p-4 w-72">
            <div className="flex justify-between items-center mb-6">
                <span className="font-serif text-lg font-bold text-[#141413]">Recents</span>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-gray-200 rounded-md">
                    <X size={18} />
                </button>
            </div>

            <button
                onClick={handleNewChat}
                className="flex items-center gap-3 w-full bg-[#D97757] hover:bg-[#C06345] text-white p-3 rounded-lg mb-6 transition-colors shadow-sm"
            >
                <Plus size={18} />
                <span className="font-medium">New Chat</span>
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Today</div>
                {chatHistory.map(chat => (
                    <button
                        key={chat.id}
                        onClick={() => {
                            setSidebarOpen(false);
                            setActiveTabId('main');
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-white transition-colors text-sm text-[#424240] truncate"
                    >
                        <span className="block truncate">{chat.title}</span>
                    </button>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-300">
                <button
                    onClick={() => setSettingsOpen(true)}
                    className="flex items-center gap-2 w-full p-2 text-sm text-[#424240] hover:bg-white rounded-lg transition-colors"
                >
                      <Settings size={18} />
                      <span>Learning Profile</span>
                </button>
                <div className="mt-2 flex items-center gap-2 p-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-serif">
                        DL
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-[#141413]">Derek Lomas</div>
                        <div className="text-xs text-gray-500">Max Plan</div>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
          <header className="h-14 flex items-center justify-between px-4 border-b border-[#E6E4DD] bg-[#FAF9F6] shrink-0 z-10">
                <div
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-[#EFECE6] rounded-md cursor-pointer shrink-0 transition-colors"
                >
                    <Menu size={20} className="text-[#424240]" />
                </div>
                <div className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <span className="hidden md:inline">Claude Tabs</span>
                </div>
                <div className="w-8"></div>
          </header>

          <main className="flex-1 flex overflow-hidden relative bg-[#FAF9F6]">
            {renderActiveTabContent()}
          </main>

          {/* Input Area (Main Chat Only) */}
          {activeTabId === 'main' && (
            <div className="p-4 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-[#FAF9F6]/0 z-20 shrink-0">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#D1D1D1] shadow-lg flex items-center p-2 gap-2 focus-within:ring-2 focus-within:ring-[#D97757]/20 transition-all">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Layers size={20} />
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Message Claude..."
                        className="flex-1 bg-transparent border-none outline-none text-[#141413] px-2 font-sans placeholder:text-gray-400"
                    />

                    <button
                        onClick={() => setLearningModeOn(!learningModeOn)}
                        className={`
                            hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all
                            ${learningModeOn
                                ? 'bg-orange-100 text-[#D97757] hover:bg-orange-200'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }
                        `}
                    >
                        <Sparkles size={12} fill={learningModeOn ? "currentColor" : "none"}/>
                        {learningModeOn ? "Learn" : "Off"}
                    </button>

                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className={`p-2 rounded-xl transition-colors ${inputText.trim() ? 'bg-[#D97757] text-white hover:bg-[#C06345]' : 'bg-gray-200 text-gray-400'}`}
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
          )}

          {/* Bottom Tab Bar */}
          <nav className="h-[65px] bg-[#FFFFFF] border-t border-[#E6E4DD] flex items-center px-4 gap-4 overflow-x-auto shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-30 no-scrollbar relative">
            <div className="absolute right-0 top-[-30px] pr-4 hidden md:flex gap-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider pointer-events-none">
                <span className="bg-white/50 px-1 rounded">Opt + ←/→ Nav</span>
                <span className="bg-white/50 px-1 rounded">Opt + ↑ New Tab</span>
            </div>

            {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0
                ${activeTabId === tab.id
                    ? 'bg-[#1C1C1A] text-white shadow-md transform scale-105'
                    : 'bg-[#F2F0EB] text-[#5C5C5A] hover:bg-[#E6E4DD]'
                }
                `}
            >
                {tab.type === 'chat'
                    ? <MessageSquare size={14} />
                    : (tab.loading ? <Loader2 size={14} className="animate-spin"/> : <BookOpen size={14} />)
                }
                <span className="max-w-[100px] truncate">{tab.title}</span>
                {tab.id !== 'main' && (
                <span
                    onClick={(e) => closeTab(e, tab.id)}
                    className={`ml-1 p-0.5 rounded-full ${activeTabId === tab.id ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
                >
                    <X size={12} />
                </span>
                )}
            </button>
            ))}
          </nav>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
