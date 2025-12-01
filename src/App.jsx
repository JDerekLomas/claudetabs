import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  BookOpen,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Loader2,
  Plus,
  Save,
  Keyboard,
  Search,
  Code,
  MessageCircle,
  FolderOpen,
  Blocks,
  ChevronDown,
  ChevronUp,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sliders,
  PanelLeftClose,
  PanelLeft,
  GraduationCap,
  User,
  Target,
  Lightbulb,
  History
} from 'lucide-react';
import MarkdownRenderer from './components/MarkdownRenderer';
import ArtifactPreview from './components/ArtifactPreview';

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

// --- Mock Data ---
const DEFAULT_PRELOADED_SUMMARIES = {
  "React Three Fiber": "A React renderer for Three.js.",
  "Cannon.js": "A lightweight 3D physics engine.",
  "Game Loop": "The central heartbeat of any game.",
  "Constructive Solid Geometry": "A modeling technique for 3D shapes."
};

const DEFAULT_CHAT = {
  id: 'chat-1',
  title: 'New Chat',
  messages: []
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

  // User Profile State (Background ||| Aspirations ||| Learning Goals)
  const [userProfile, setUserProfile] = useState("I'm a professor of positive AI at Delft University of Technology. I have a background in cognitive science, art, human-centered design, and HCI.|||I want to make top-level connections in AI & experience design, particularly in education.|||I want to understand React more deeply and keep getting better and better at vibecoding.");

  // Chat Data State - store messages per chat
  const [chats, setChats] = useState({
    'chat-1': {
      title: 'Help me build a marble run in three.js',
      messages: DEFAULT_CHAT.messages
    },
    'chat-2': {
      title: 'Understanding Redux Middleware',
      messages: []
    },
    'chat-3': {
      title: 'CSS Grid Layouts',
      messages: []
    }
  });
  const [activeChatId, setActiveChatId] = useState('chat-1');

  // Derived state for current chat
  const messages = chats[activeChatId]?.messages || [];
  const setMessages = (updater) => {
    setChats(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: typeof updater === 'function'
          ? updater(prev[activeChatId]?.messages || [])
          : updater
      }
    }));
  };

  // Chat history derived from chats
  const chatHistory = Object.entries(chats).map(([id, chat]) => ({
    id,
    title: chat.title
  }));

  // Input State
  const [inputText, setInputText] = useState("");
  const [sideInputText, setSideInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Tab State
  const [tabs, setTabs] = useState([{ id: 'main', title: 'New Chat', type: 'chat', content: null }]);
  const [activeTabId, setActiveTabId] = useState('main');

  // Concept cache for Deep Dive tab summaries
  const [conceptCache, setConceptCache] = useState(DEFAULT_PRELOADED_SUMMARIES);

  // Handler for running artifacts - opens as a tab instead of modal
  const handleRunArtifact = (code, language) => {
    const artifactTabId = `artifact-${Date.now()}`;
    const newTab = {
      id: artifactTabId,
      title: `${language.toUpperCase()} Preview`,
      type: 'artifact',
      content: {
        code,
        language
      }
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(artifactTabId);
  };

  // --- System Prompts ---
  const getMainChatSystemPrompt = () => {
    if (!learningModeOn) {
      return `You are Claude, a helpful AI assistant. Respond naturally and helpfully.`;
    }

    return `You are Claude, a helpful AI assistant with Learning Mode enabled.

YOUR PRIMARY GOAL: Complete the user's task effectively. Learning support is secondary.

LEARNER CONTEXT (for reference):
${userProfile}

---

RESPONSE APPROACH:

1. Focus on solving the user's problem directly and efficiently.

2. While explaining your approach, include 2-4 learning links for specialized terms, library names, or technical concepts. Format: [[term::50-100 word explanation]]

3. For coding tasks: Brief explanation with learning links FIRST, then code.

---

LEARNING LINKS - What to highlight:
- Library/framework names (React, Tailwind, Vite, etc.)
- Technical terms the user may want to explore (hooks, closures, middleware)
- Design patterns or architectural concepts
- APIs, protocols, or standards

Format: [[term::substantial explanation that satisfies initial curiosity]]

Example:
- [[Framer Motion::A production-ready animation library for React that makes complex animations simple. It uses a declarative approach where you describe what you want (initial state, animate to, exit state) and it handles the physics and timing. Popular for page transitions, gesture-based interactions, and layout animations.]]

---

REACT ARTIFACTS:
- Use \`\`\`jsx code blocks with complete components
- Include: \`export default function ComponentName()\`
- Explicit imports: \`import { useState, useEffect } from 'react'\`
- Use Tailwind CSS for styling

Available: lucide-react, recharts, framer-motion, date-fns, lodash, mathjs

Constraints: No localStorage, no external APIs, no require()

Design: Modern aesthetics with gradients, shadows, animations.`;
  };

  const getDeepDiveSystemPrompt = (term) => {
    return `You are Claude explaining "${term}" in a focused Deep Dive sidebar.

CONCEPT: "${term}"

YOUR TASK (80% concept, 20% personalization):
1. Explain "${term}" clearly and thoroughly - what it is, how it works, why it matters
2. Focus on the concept itself, not the learner's interests
3. Include 2-3 learning links for related technical concepts: [[term::50-word explanation]]
4. Use code examples if they help clarify (use proper fenced code blocks)
5. End with: RELATED: Term 1, Term 2, Term 3

LEARNER CONTEXT (use sparingly - just to calibrate depth/examples):
${userProfile}

Be direct and informative. This is a reference explanation, not a personalized lesson.`;
  };

  const getSideChatSystemPrompt = (topic) => {
    return `You are Claude in a focused side conversation about "${topic}".

LEARNER PROFILE:
${userProfile}

CONTEXT: The learner opened a Deep Dive tab about "${topic}" and is asking follow-up questions.

YOUR BEHAVIOR:
1. Keep answers focused on "${topic}" and closely related concepts
2. Use [[learning links::with brief definitions]] for terms worth exploring
3. Provide code examples when helpful (use fenced code blocks)
4. Be concise - this is a side conversation, not the main chat
5. Connect explanations to the learner's interests when possible`;
  };


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
    const handleSelection = (e) => {
      // Don't process if clicking on a learning link or interactive element
      if (e.target.closest('[data-learning-link]') ||
          e.target.closest('button') ||
          e.target.closest('a') ||
          e.target.closest('input')) {
        return;
      }

      // Small delay to let click handlers run first
      setTimeout(() => {
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
      }, 10);
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // --- API: Fetch Definition (Deep Dive) with Streaming ---
  const fetchConceptDataStreaming = async (term, tabId) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', // Haiku for side conversations
          system: getDeepDiveSystemPrompt(term),
          messages: [{
            role: 'user',
            content: `Explain "${term}" to me.`
          }]
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      // Mark as no longer loading, start streaming
      setTabs(prev => prev.map(t => {
        if (t.id === tabId) {
          return {
            ...t,
            loading: false,
            content: {
              ...t.content,
              messages: [{ id: 'init', role: 'ai', text: '' }]
            }
          };
        }
        return t;
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete SSE messages from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
              }
            } catch (parseError) {
              // Ignore parse errors
            }
          }
        }

        // Update after each chunk read (not each SSE line) for smoother streaming
        if (fullText) {
          setTabs(prev => prev.map(t => {
            if (t.id === tabId) {
              return {
                ...t,
                content: {
                  ...t.content,
                  messages: [{ id: 'init', role: 'ai', text: fullText }]
                }
              };
            }
            return t;
          }));
        }
      }

      // Parse RELATED section after streaming completes
      const relatedMatch = fullText.match(/RELATED:\s*(.+)$/i);
      const related = relatedMatch
        ? relatedMatch[1].split(',').map(t => t.trim()).filter(t => t)
        : [];

      const explanation = relatedMatch
        ? fullText.substring(0, relatedMatch.index).trim()
        : fullText;

      // Final update with related terms
      setTabs(prev => prev.map(t => {
        if (t.id === tabId) {
          return {
            ...t,
            content: {
              ...t.content,
              messages: [{ id: 'init', role: 'ai', text: explanation }],
              related: related
            }
          };
        }
        return t;
      }));

    } catch (error) {
      console.error("Claude API Error:", error);
      setTabs(prev => prev.map(t => {
        if (t.id === tabId) {
          return {
            ...t,
            loading: false,
            content: {
              ...t.content,
              messages: [{ id: 'init', role: 'ai', text: 'We encountered an error connecting to Claude.' }]
            }
          };
        }
        return t;
      }));
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
          system: getMainChatSystemPrompt(),
          messages: messages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.text
          })).concat([{ role: 'user', content: inputText }])
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let aiMsgId = Date.now() + 1;

      // Add placeholder message
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', text: '' }]);

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
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Update chat and tab title if new chat
      if (isNewChat && fullText) {
        const firstLine = inputText.split('\n')[0];
        const newTitle = firstLine.slice(0, 50) + (firstLine.length > 50 ? '...' : '');
        setTabs(prev => prev.map(t => t.id === 'main' ? { ...t, title: newTitle } : t));
        setChats(prev => ({
          ...prev,
          [activeChatId]: { ...prev[activeChatId], title: newTitle }
        }));
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
          model: 'claude-haiku-4-5-20251001', // Haiku for side conversations
          system: getSideChatSystemPrompt(currentTab.title),
          messages: currentTab.content.messages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.text
          })).concat([{ role: 'user', content: sideInputText }])
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
              messages: [...t.content.messages, { id: aiMsgId, role: 'assistant', text: '' }]
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

  // --- Static Pages ---
  const STATIC_PAGES = {
    'Learning Mode': `## Supporting Curiosity-Driven Learning

**Claude Tabs** supports curiosity-driven "Deep Dives" to supplement human understanding while conducting AI work, particularly vibecoding.

While vibecoding, you can open up new tabs to learn more about the software libraries or design approach—supporting intrinsically motivated learning.

**Claude Tabs supports the flow of curiosity around the flow of work.**

---

### How It Works

With Learning Mode on, when you ask Claude to perform a task—like create some vibecoded software—Claude will highlight key technical terms and library names.

**Learning Links** highlight relevant concepts for further learning. Clicking those links opens a new tab that explains the concept in depth.

Learning links provide immediate curiosity satisfaction without disrupting the flow of the main task.

---

### Text Selection Deep Dive

You can also highlight any text to "Learn More"—so you can dive deep on anything in a side conversation.

---

### Keyboard Shortcuts

- **Opt + ←/→**: Navigate between tabs
- **Opt + ↑**: Open new learning tab
- **Opt + ↓**: Close current tab (if not main)

---

**Keep Learning.**`
  };

  // --- Handlers ---
  // handleOpenTab accepts optional definition from [[term::definition]] links
  const handleOpenTab = async (term, definition = null) => {
    setSearchModalOpen(false);
    setSelectionBox(null);
    window.getSelection()?.removeAllRanges();

    const existingTab = tabs.find(t => t.title.toLowerCase() === term.toLowerCase());
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    // Check for static pages first
    if (STATIC_PAGES[term]) {
      const newTabId = `tab-${Date.now()}`;
      const newTab = {
        id: newTabId,
        title: term,
        type: 'static',
        content: STATIC_PAGES[term]
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTabId);
      return;
    }

    // Use inline definition if provided, otherwise fall back to cache or placeholder
    const preloadSummary = definition || conceptCache[term] || `Exploring ${term}...`;

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

    // Start streaming (non-blocking)
    fetchConceptDataStreaming(term, newTabId);
  };

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setChats(prev => ({
      ...prev,
      [newChatId]: { title: 'New Chat', messages: [] }
    }));
    setActiveChatId(newChatId);
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
             <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h1 className="text-4xl md:text-5xl font-serif text-[#2D2D2A] mb-3">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return 'Good morning';
                    if (hour < 17) return 'Good afternoon';
                    return 'Good evening';
                  })()}, Derek
                </h1>
                {learningModeOn && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#D97757] text-sm font-medium">
                      <Sparkles size={16} />
                      <span>Learning Mode Active</span>
                    </div>
                    <p className="text-sm text-[#6B6B6B] mt-3 max-w-md mx-auto leading-relaxed">
                      Click to explore <button
                        onClick={() => handleOpenTab('Learning Mode')}
                        className="text-[#D97757] font-medium border-b border-[#D97757] border-opacity-40 hover:bg-orange-50 cursor-pointer"
                      >highlighted</button> responses in side tabs. Or highlight any text and select "Deep Dive."
                    </p>
                  </div>
                )}
             </div>
          )}
          {messages.map((msg, idx) => (
             <div key={msg.id} className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className="max-w-[90%] md:max-w-[80%]">
                 <div className={`rounded-2xl p-4 md:p-6 shadow-sm ${
                   msg.role === 'user' ? 'bg-[#EFECE6] text-[#424240]' : 'bg-white text-[#141413] border border-[#E6E4DD]'
                 }`}>
                   <MarkdownRenderer
                      content={msg.text}
                      onChipClick={handleOpenTab}
                      onRunArtifact={handleRunArtifact}
                      isSerif={msg.role === 'assistant' || msg.role === 'ai'}
                   />
                 </div>
                 {/* Message actions for AI responses */}
                 {(msg.role === 'assistant' || msg.role === 'ai') && msg.text && (
                   <div className="flex items-center gap-1 mt-2 ml-1">
                     <button className="p-1.5 hover:bg-[#EFECE6] rounded-lg transition-colors text-[#9B9B9B] hover:text-[#6B6B6B]" title="Copy">
                       <Copy size={16} />
                     </button>
                     <button className="p-1.5 hover:bg-[#EFECE6] rounded-lg transition-colors text-[#9B9B9B] hover:text-[#6B6B6B]" title="Good response">
                       <ThumbsUp size={16} />
                     </button>
                     <button className="p-1.5 hover:bg-[#EFECE6] rounded-lg transition-colors text-[#9B9B9B] hover:text-[#6B6B6B]" title="Bad response">
                       <ThumbsDown size={16} />
                     </button>
                     <button className="p-1.5 hover:bg-[#EFECE6] rounded-lg transition-colors text-[#9B9B9B] hover:text-[#6B6B6B] flex items-center gap-1" title="Retry">
                       <RotateCcw size={16} />
                       <span className="text-xs">Retry</span>
                     </button>
                   </div>
                 )}
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

    // Artifact tab - full-screen code preview
    if (activeTab.type === 'artifact') {
      return (
        <div className="flex-1 flex flex-col bg-white">
          <ArtifactPreview
            code={activeTab.content.code}
            language={activeTab.content.language}
            title={activeTab.title}
            onClose={() => closeTab(null, activeTab.id)}
          />
        </div>
      );
    }

    // Static page tab (e.g., Learning Mode info)
    if (activeTab.type === 'static') {
      return (
        <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right-10 duration-300">
          <div className="p-6 md:p-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-[#D97757] text-xs font-bold tracking-wider uppercase mb-2">
              <Sparkles size={12} />
              Guide
            </div>
            <h1 className={`text-3xl md:text-4xl ${FONTS.serif} text-[#141413] leading-tight`}>
              {activeTab.title}
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="text-[#141413] text-lg leading-relaxed font-serif">
              <MarkdownRenderer
                content={activeTab.content}
                onChipClick={handleOpenTab}
                onRunArtifact={handleRunArtifact}
                isSerif={true}
              />
            </div>
          </div>
        </div>
      );
    }

    // Learning/Deep Dive tab
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
            {/* Pre-generated summary - commented out to test pure Haiku streaming
            <p className="text-sm text-gray-500 mt-2 font-serif italic border-l-2 border-[#D97757] pl-3">
                {activeTab.content?.short}
            </p>
            */}
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
                                <MarkdownRenderer
                                  content={msg.text}
                                  onChipClick={handleOpenTab}
                                  onRunArtifact={handleRunArtifact}
                                  isSerif={msg.role === 'ai'}
                                />
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
      {selectionBox && selectedText && (
          <div
            className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
            style={{ top: selectionBox.top, left: selectionBox.left }}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
          >
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const text = selectedText; // Capture before clearing
                  setSelectionBox(null);
                  setSelectedText("");
                  window.getSelection()?.removeAllRanges();
                  handleOpenTab(text);
                }}
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

      {/* Learning Profile Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-[#E6E4DD] bg-[#FAF9F6]">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-[#D97757] mb-1">
                                <GraduationCap size={20} />
                                <span className="text-sm font-medium uppercase tracking-wide">Learning Mode</span>
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-[#141413]">Your Learning Profile</h3>
                        </div>
                        <button onClick={() => setSettingsOpen(false)} className="p-1.5 hover:bg-[#EFECE6] rounded-lg transition-colors">
                            <X size={20} className="text-[#6B6B6B]" />
                        </button>
                    </div>
                    <p className="text-sm text-[#6B6B6B] mt-2">
                        Help Claude understand your background so it can personalize explanations and highlight relevant concepts for you.
                    </p>
                </div>

                {/* Toggle */}
                <div className="px-6 py-4 border-b border-[#E6E4DD] flex items-center justify-between">
                    <div>
                        <div className="font-medium text-[#2D2D2A]">Enable Learning Mode</div>
                        <div className="text-sm text-[#6B6B6B]">Highlight concepts and adapt explanations</div>
                    </div>
                    <button
                        onClick={() => setLearningModeOn(!learningModeOn)}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                            learningModeOn ? 'bg-[#D97757]' : 'bg-[#E6E4DD]'
                        }`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            learningModeOn ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {/* Background */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2A] mb-2">
                            <User size={16} className="text-[#D97757]" />
                            Your Background
                        </label>
                        <textarea
                            placeholder="e.g., I'm a frontend developer with 3 years of experience. I know React and TypeScript well, but I'm new to 3D graphics..."
                            value={userProfile.split('|||')[0] || ''}
                            onChange={(e) => {
                                const parts = userProfile.split('|||');
                                setUserProfile([e.target.value, parts[1] || '', parts[2] || ''].join('|||'));
                            }}
                            className="w-full h-24 p-3 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] text-[#2D2D2A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#D97757] resize-none text-sm"
                        />
                    </div>

                    {/* Aspirations */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2A] mb-2">
                            <Lightbulb size={16} className="text-[#D97757]" />
                            Aspirations
                        </label>
                        <textarea
                            placeholder="e.g., I want to build my own indie games, create interactive art installations, or work at a game studio..."
                            value={userProfile.split('|||')[1] || ''}
                            onChange={(e) => {
                                const parts = userProfile.split('|||');
                                setUserProfile([parts[0] || '', e.target.value, parts[2] || ''].join('|||'));
                            }}
                            className="w-full h-24 p-3 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] text-[#2D2D2A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#D97757] resize-none text-sm"
                        />
                    </div>

                    {/* Learning Goals */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2A] mb-2">
                            <Target size={16} className="text-[#D97757]" />
                            Learning Goals
                        </label>
                        <textarea
                            placeholder="e.g., I want to understand game physics, learn Three.js, and build interactive 3D experiences..."
                            value={userProfile.split('|||')[2] || ''}
                            onChange={(e) => {
                                const parts = userProfile.split('|||');
                                setUserProfile([parts[0] || '', parts[1] || '', e.target.value].join('|||'));
                            }}
                            className="w-full h-24 p-3 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] text-[#2D2D2A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#D97757] resize-none text-sm"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#E6E4DD] bg-[#FAF9F6] flex justify-between items-center">
                    <p className="text-xs text-[#9B9B9B]">
                        Your profile is stored locally and used to personalize Claude's responses.
                    </p>
                    <button
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center gap-2 px-5 py-2 bg-[#D97757] hover:bg-[#C06345] text-white rounded-lg font-medium transition-colors text-sm"
                    >
                        <Save size={16} />
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Collapsed Icon Sidebar - Claude Style */}
      <aside className="w-[52px] bg-[#FAF9F6] border-r border-[#E6E4DD] flex flex-col items-center py-3 shrink-0">
        {/* Collapse/Expand Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg hover:bg-[#EFECE6] flex items-center justify-center text-[#6B6B6B] transition-colors mb-2"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-9 h-9 rounded-lg bg-[#D97757] hover:bg-[#C06345] flex items-center justify-center text-white transition-colors mb-3"
          title="New Chat"
        >
          <Plus size={20} />
        </button>

        {/* Icon Navigation */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="w-9 h-9 rounded-lg hover:bg-[#EFECE6] flex items-center justify-center text-[#6B6B6B] transition-colors"
            title="Search"
          >
            <Search size={20} />
          </button>
          <button
            className="w-9 h-9 rounded-lg hover:bg-[#EFECE6] flex items-center justify-center text-[#6B6B6B] transition-colors"
            title="History"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <History size={20} />
          </button>
          <button
            className="w-9 h-9 rounded-lg hover:bg-[#EFECE6] flex items-center justify-center text-[#6B6B6B] transition-colors"
            title="Projects"
          >
            <FolderOpen size={20} />
          </button>
          <button
            className="w-9 h-9 rounded-lg hover:bg-[#EFECE6] flex items-center justify-center text-[#6B6B6B] transition-colors"
            title="Integrations"
          >
            <Blocks size={20} />
          </button>
          <button
            className="w-9 h-9 rounded-lg hover:bg-[#EFECE6] flex items-center justify-center text-[#6B6B6B] transition-colors"
            title="Code"
          >
            <Code size={20} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              learningModeOn
                ? 'bg-orange-50 text-[#D97757]'
                : 'hover:bg-[#EFECE6] text-[#6B6B6B]'
            }`}
          >
            <GraduationCap size={20} />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Avatar */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-9 h-9 rounded-full bg-[#3D3D3D] flex items-center justify-center text-white text-xs font-medium hover:ring-2 hover:ring-[#D97757] transition-all"
          title="Settings"
        >
          DL
        </button>
      </aside>

      {/* Expanded Sidebar Panel (overlay) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-[52px] top-0 bottom-0 w-72 bg-[#FAF9F6] border-r border-[#E6E4DD] z-50 shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#E6E4DD]">
              <span className="font-serif text-xl font-bold text-[#141413]">Claude</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-[#EFECE6] rounded-md">
                <PanelLeftClose size={18} className="text-[#6B6B6B]" />
              </button>
            </div>

            {/* Navigation */}
            <div className="p-3 space-y-1">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-[#D97757] hover:bg-[#C06345] text-white transition-colors"
              >
                <Plus size={18} />
                <span className="font-medium">New chat</span>
              </button>

              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#EFECE6] text-[#424240] transition-colors">
                <MessageCircle size={18} />
                <span>Chats</span>
              </button>

              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#EFECE6] text-[#424240] transition-colors">
                <FolderOpen size={18} />
                <span>Projects</span>
              </button>

              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#EFECE6] text-[#424240] transition-colors">
                <Blocks size={18} />
                <span>Artifacts</span>
              </button>

              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#EFECE6] text-[#424240] transition-colors">
                <Code size={18} />
                <span>Code</span>
              </button>

              <button
                onClick={() => { setSidebarOpen(false); setSettingsOpen(true); }}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                  learningModeOn
                    ? 'bg-orange-50 text-[#D97757]'
                    : 'hover:bg-[#EFECE6] text-[#424240]'
                }`}
              >
                <GraduationCap size={18} />
                <span>Learning Mode</span>
                {learningModeOn && <span className="ml-auto text-xs bg-[#D97757] text-white px-1.5 py-0.5 rounded">ON</span>}
              </button>
            </div>

            {/* Recents section */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <div className="text-xs font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">Recents</div>
              <div className="space-y-1">
                {chatHistory.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setActiveTabId('main');
                      setTabs(prev => prev.map(t => t.id === 'main' ? { ...t, title: chat.title } : t));
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm truncate ${
                      activeChatId === chat.id
                        ? 'bg-[#EFECE6] text-[#2D2D2A] font-medium'
                        : 'text-[#424240] hover:bg-[#EFECE6]'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* User section */}
            <div className="p-3 border-t border-[#E6E4DD]">
              <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-[#EFECE6] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#3D3D3D] flex items-center justify-center text-white text-xs font-medium">
                  DL
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#2D2D2A]">Derek Lomas</div>
                  <div className="text-xs text-[#9B9B9B]">Max plan</div>
                </div>
                <ChevronUp size={16} className="text-[#9B9B9B]" />
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
          {/* Header with conversation title */}
          <header className="h-12 flex items-center justify-between px-4 bg-[#FAF9F6] shrink-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#2D2D2A]">
                    {tabs.find(t => t.id === activeTabId)?.title || 'New Chat'}
                  </span>
                  <ChevronDown size={16} className="text-[#6B6B6B]" />
                </div>
                <button className="px-3 py-1.5 text-sm font-medium text-[#2D2D2A] hover:bg-[#EFECE6] rounded-lg transition-colors">
                  Share
                </button>
          </header>

          <main className="flex-1 flex overflow-hidden relative bg-[#FAF9F6]">
            {renderActiveTabContent()}
          </main>

          {/* Input Area (Main Chat Only) */}
          {activeTabId === 'main' && (
            <div className="px-4 pb-4 pt-2 bg-[#FAF9F6] z-20 shrink-0">
                {/* Input Box */}
                <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E6E4DD] shadow-sm">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="How can I help you today?"
                        className="w-full bg-transparent border-none outline-none text-[#141413] px-4 py-3 font-sans placeholder:text-[#9B9B9B] text-base"
                    />
                    <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-[#EFECE6] rounded-lg transition-colors text-[#6B6B6B]" title="Attach file">
                                <Plus size={20} />
                            </button>
                            <button className="p-2 hover:bg-[#EFECE6] rounded-lg transition-colors text-[#6B6B6B]" title="Settings">
                                <Sliders size={20} />
                            </button>
                            <div className="relative group">
                                <button
                                    onClick={() => setLearningModeOn(!learningModeOn)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                                      learningModeOn
                                        ? 'text-[#D97757] bg-orange-50 hover:bg-orange-100'
                                        : 'text-[#6B6B6B] hover:bg-[#EFECE6]'
                                    }`}
                                >
                                    <Sparkles size={16} />
                                    <span className="hidden sm:inline">Learning Mode</span>
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1C1C1A] text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                                    {learningModeOn ? 'Disable' : 'Enable'} Learning Mode
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-6 border-transparent border-t-[#1C1C1A]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 px-2 py-1 text-sm text-[#6B6B6B] hover:bg-[#EFECE6] rounded-lg transition-colors">
                                <span>Sonnet 4</span>
                                <ChevronDown size={14} />
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim()}
                                className={`p-2 rounded-xl transition-colors ${inputText.trim() ? 'bg-[#D97757] text-white hover:bg-[#C06345]' : 'bg-[#EAE8E3] text-[#B5B3AD]'}`}
                            >
                                <ArrowUp size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-xs text-[#9B9B9B] mt-3">
                    Claude can make mistakes. Please double-check responses.
                </p>
            </div>
          )}

          {/* Bottom Tab Bar - Only shows when multiple tabs exist */}
          {tabs.length > 1 && (
            <nav className="h-[56px] bg-[#FFFFFF] border-t border-[#E6E4DD] flex items-center px-4 gap-3 overflow-x-auto shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-30 no-scrollbar">
              {/* New Tab Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="w-9 h-9 rounded-full bg-[#F2F0EB] hover:bg-[#E6E4DD] flex items-center justify-center text-[#6B6B6B] transition-colors shrink-0"
                title="New Learning Tab (Opt+↑)"
              >
                <Plus size={18} />
              </button>

              {/* Tabs */}
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0
                    ${activeTabId === tab.id
                      ? 'bg-[#1C1C1A] text-white shadow-md'
                      : 'bg-[#F2F0EB] text-[#5C5C5A] hover:bg-[#E6E4DD]'
                    }
                  `}
                >
                  {tab.type === 'chat'
                    ? <MessageSquare size={14} />
                    : tab.type === 'artifact'
                    ? <Code size={14} />
                    : (tab.loading ? <Loader2 size={14} className="animate-spin"/> : <BookOpen size={14} />)
                  }
                  <span className="max-w-[120px] truncate">{tab.title}</span>
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

              {/* Spacer */}
              <div className="flex-1" />

              {/* Keyboard hints */}
              <div className="hidden md:flex items-center gap-3 text-[11px] text-[#9B9B9B] shrink-0">
                <span><kbd className="px-1.5 py-0.5 bg-[#F2F0EB] rounded text-[10px]">Opt</kbd> + <kbd className="px-1.5 py-0.5 bg-[#F2F0EB] rounded text-[10px]">←→</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 bg-[#F2F0EB] rounded text-[10px]">Opt</kbd> + <kbd className="px-1.5 py-0.5 bg-[#F2F0EB] rounded text-[10px]">↓</kbd> Close</span>
              </div>
            </nav>
          )}
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
