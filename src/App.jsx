import { useState } from 'react'
import './App.css'

function App() {
  // Initial conversations with tabs
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Help me build a marble run in three.js',
      starred: false,
      tabs: [
        {
          id: 1,
          name: 'Main',
          messages: [
            { role: 'user', content: 'Help me build a marble run in three.js and start by explaining how it works and giving me link to satisfy my technical curiosity' },
            { role: 'assistant', content: "I'll help you build a marble run in three.js! Let me start by explaining the physics and rendering architecture you'll need." }
          ]
        }
      ],
      activeTabId: 1
    }
  ])

  const [activeConversationId, setActiveConversationId] = useState(1)
  const [inputValue, setInputValue] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Get current conversation and active tab
  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const activeTab = activeConversation?.tabs.find(t => t.id === activeConversation.activeTabId)

  const starredConversations = conversations.filter(c => c.starred)
  const recentConversations = conversations.filter(c => !c.starred)

  // Add a new conversation
  const addConversation = () => {
    const newId = Math.max(...conversations.map(c => c.id), 0) + 1
    const newConversation = {
      id: newId,
      name: 'Untitled',
      starred: false,
      tabs: [
        {
          id: 1,
          name: 'Main',
          messages: []
        }
      ],
      activeTabId: 1
    }
    setConversations([newConversation, ...conversations])
    setActiveConversationId(newId)
  }

  // Add a new tab to current conversation
  const addTab = () => {
    if (!activeConversation) return

    const newTabId = Math.max(...activeConversation.tabs.map(t => t.id)) + 1
    const newTab = {
      id: newTabId,
      name: `Tab ${newTabId}`,
      messages: []
    }

    setConversations(conversations.map(conv =>
      conv.id === activeConversationId
        ? { ...conv, tabs: [...conv.tabs, newTab], activeTabId: newTabId }
        : conv
    ))
  }

  // Switch active tab
  const switchTab = (tabId) => {
    setConversations(conversations.map(conv =>
      conv.id === activeConversationId
        ? { ...conv, activeTabId: tabId }
        : conv
    ))
  }

  // Close a tab
  const closeTab = (tabId, e) => {
    e.stopPropagation()

    if (!activeConversation || activeConversation.tabs.length === 1) return

    const tabIndex = activeConversation.tabs.findIndex(t => t.id === tabId)
    const newTabs = activeConversation.tabs.filter(t => t.id !== tabId)

    // If closing active tab, switch to adjacent tab
    let newActiveTabId = activeConversation.activeTabId
    if (tabId === activeConversation.activeTabId) {
      newActiveTabId = newTabs[Math.max(0, tabIndex - 1)].id
    }

    setConversations(conversations.map(conv =>
      conv.id === activeConversationId
        ? { ...conv, tabs: newTabs, activeTabId: newActiveTabId }
        : conv
    ))
  }

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !activeConversation || !activeTab) return

    const userMessage = { role: 'user', content: inputValue }
    const currentInput = inputValue
    setInputValue('')

    // Add user message immediately
    const isFirstMessage = activeTab.messages.length === 0 && activeConversation.name === 'Untitled'
    const newConversationName = isFirstMessage
      ? currentInput.slice(0, 50) + (currentInput.length > 50 ? '...' : '')
      : activeConversation.name

    setConversations(prevConvs => prevConvs.map(conv => {
      if (conv.id !== activeConversationId) return conv
      return {
        ...conv,
        name: newConversationName,
        tabs: conv.tabs.map(tab =>
          tab.id === activeTab.id
            ? { ...tab, messages: [...tab.messages, userMessage] }
            : tab
        )
      }
    }))

    // Prepare assistant message placeholder
    const assistantMessageId = Date.now()
    setConversations(prevConvs => prevConvs.map(conv => {
      if (conv.id !== activeConversationId) return conv
      return {
        ...conv,
        tabs: conv.tabs.map(tab =>
          tab.id === activeTab.id
            ? { ...tab, messages: [...tab.messages, { role: 'assistant', content: '', id: assistantMessageId }] }
            : tab
        )
      }
    }))

    try {
      // Build conversation history for API
      const apiMessages = activeTab.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      apiMessages.push({ role: 'user', content: currentInput })

      // Call streaming API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: 'claude-opus-4-20250514'
        }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accumulatedContent += parsed.text

                // Update the assistant message with accumulated content
                setConversations(prevConvs => prevConvs.map(conv => {
                  if (conv.id !== activeConversationId) return conv
                  return {
                    ...conv,
                    tabs: conv.tabs.map(tab =>
                      tab.id === activeTab.id
                        ? {
                            ...tab,
                            messages: tab.messages.map(msg =>
                              msg.id === assistantMessageId
                                ? { ...msg, content: accumulatedContent }
                                : msg
                            )
                          }
                        : tab
                    )
                  }
                }))
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)

      // Update assistant message with error
      setConversations(prevConvs => prevConvs.map(conv => {
        if (conv.id !== activeConversationId) return conv
        return {
          ...conv,
          tabs: conv.tabs.map(tab =>
            tab.id === activeTab.id
              ? {
                  ...tab,
                  messages: tab.messages.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: 'Sorry, there was an error processing your request. Please try again.' }
                      : msg
                  )
                }
              : tab
          )
        }
      }))
    }
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="18" rx="1"/>
              <rect x="14" y="3" width="7" height="18" rx="1"/>
            </svg>
          </button>
          {!sidebarCollapsed && <span className="sidebar-brand">Claude</span>}
        </div>

        {!sidebarCollapsed && (
          <>
            <button className="new-chat-button" onClick={addConversation}>
              <span className="plus-icon">+</span>
              <span>New chat</span>
            </button>

            <nav className="sidebar-nav">
              <div className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Chats</span>
              </div>
              <div className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Projects</span>
              </div>
              <div className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <span>Artifacts</span>
              </div>
              <div className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                <span>Code</span>
                <svg className="external-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </div>
            </nav>

            {starredConversations.length > 0 && (
              <>
                <div className="section-title">Starred</div>
                <div className="conversations-list">
                  {starredConversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`conversation-item ${conv.id === activeConversationId ? 'active' : ''}`}
                      onClick={() => setActiveConversationId(conv.id)}
                    >
                      <span className="conversation-name">{conv.name}</span>
                      {conv.tabs.length > 1 && (
                        <span className="tab-badge">{conv.tabs.length}</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="conversations-list">
              {recentConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${conv.id === activeConversationId ? 'active' : ''}`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <span className="conversation-name">{conv.name}</span>
                  {conv.tabs.length > 1 && (
                    <span className="tab-badge">{conv.tabs.length}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="sidebar-footer">
              <div className="user-profile">
                <div className="user-avatar">DL</div>
                <div className="user-info">
                  <div className="user-name">Derek Lomas</div>
                  <div className="user-plan">Max plan</div>
                </div>
                <svg className="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header with conversation name and dropdown */}
        <div className="header">
          {sidebarCollapsed && (
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18" rx="1"/>
                <rect x="14" y="3" width="7" height="18" rx="1"/>
              </svg>
            </button>
          )}
          <div className="conversation-title-wrapper">
            <h1 className="conversation-title">{activeConversation?.name || 'Untitled'}</h1>
            <svg className="title-dropdown" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        {/* Tab bar */}
        {activeConversation && activeConversation.tabs.length > 0 && (
          <div className="tab-bar">
            <div className="tabs">
              {activeConversation.tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab ${tab.id === activeConversation.activeTabId ? 'active' : ''}`}
                  onClick={() => switchTab(tab.id)}
                >
                  <span className="tab-name">{tab.name}</span>
                  {activeConversation.tabs.length > 1 && (
                    <span
                      className="close-tab"
                      onClick={(e) => closeTab(tab.id, e)}
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
              <button className="add-tab-button" onClick={addTab} title="Add new tab">
                +
              </button>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="messages-container">
          {activeTab && activeTab.messages.length > 0 ? (
            <div className="messages">
              {activeTab.messages.map((msg, idx) => (
                <div key={idx} className={`message-wrapper ${msg.role}`}>
                  {msg.role === 'user' ? (
                    <div className="user-message">
                      <div className="user-avatar">DL</div>
                      <div className="user-message-content">{msg.content}</div>
                    </div>
                  ) : (
                    <div className="assistant-message">
                      <div className="assistant-content">{msg.content}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {/* Empty state is handled by the input placeholder */}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="input-container">
          <form onSubmit={sendMessage} className="input-form">
            <textarea
              className="message-input"
              placeholder="How can I help you today?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
              rows="1"
            />
            <div className="input-actions">
              <div className="input-icons">
                <button type="button" className="input-icon-button" title="Attach">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <button type="button" className="input-icon-button" title="Random prompt">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 3 21 3 21 8"/>
                    <line x1="4" y1="20" x2="21" y2="3"/>
                    <polyline points="21 16 21 21 16 21"/>
                    <line x1="15" y1="15" x2="21" y2="21"/>
                    <line x1="4" y1="4" x2="9" y2="9"/>
                  </svg>
                </button>
                <button type="button" className="input-icon-button" title="Recent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </button>
              </div>
              <div className="model-selector">
                <span>Opus 4.1</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
