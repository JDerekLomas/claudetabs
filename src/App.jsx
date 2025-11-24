import { useState } from 'react'
import './App.css'

function App() {
  // Initial conversations with tabs
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Redesigning Claude with chat tabs',
      tabs: [
        {
          id: 1,
          name: 'Main',
          messages: [
            { role: 'user', content: 'we are going to demonstrate how to redesign claude but to have tabs within a chat' },
            { role: 'assistant', content: "I'll help you create a demonstration of a redesigned Claude interface with tabs within a chat. This could be really useful for managing multiple conversation contexts or topics in parallel." }
          ]
        }
      ],
      activeTabId: 1
    }
  ])

  const [activeConversationId, setActiveConversationId] = useState(1)
  const [inputValue, setInputValue] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Get current conversation and active tab
  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const activeTab = activeConversation?.tabs.find(t => t.id === activeConversation.activeTabId)

  // Add a new conversation
  const addConversation = () => {
    const newId = Math.max(...conversations.map(c => c.id)) + 1
    const newConversation = {
      id: newId,
      name: 'New Chat',
      tabs: [
        {
          id: 1,
          name: 'Main',
          messages: []
        }
      ],
      activeTabId: 1
    }
    setConversations([...conversations, newConversation])
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
  const sendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !activeConversation || !activeTab) return

    const userMessage = { role: 'user', content: inputValue }
    const assistantMessage = {
      role: 'assistant',
      content: `This is a demo response to: "${inputValue}". In a real implementation, this would be a response from Claude.`
    }

    setConversations(conversations.map(conv => {
      if (conv.id !== activeConversationId) return conv

      // Update conversation name based on first message
      const isFirstMessage = activeTab.messages.length === 0 && conv.name === 'New Chat'
      const newName = isFirstMessage ? inputValue.slice(0, 50) + (inputValue.length > 50 ? '...' : '') : conv.name

      return {
        ...conv,
        name: newName,
        tabs: conv.tabs.map(tab =>
          tab.id === activeTab.id
            ? { ...tab, messages: [...tab.messages, userMessage, assistantMessage] }
            : tab
        )
      }
    }))

    setInputValue('')
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="icon-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '☰' : '☰'}
          </button>
          {sidebarOpen && <span className="sidebar-title">Conversations</span>}
        </div>

        {sidebarOpen && (
          <>
            <button className="new-chat-button" onClick={addConversation}>
              <span className="plus-icon">+</span> New Chat
            </button>

            <div className="conversations-list">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${conv.id === activeConversationId ? 'active' : ''}`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <div className="conversation-icon">💬</div>
                  <div className="conversation-name">{conv.name}</div>
                  {conv.tabs.length > 1 && (
                    <div className="tab-count">{conv.tabs.length} tabs</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header with conversation name */}
        <div className="header">
          <div className="header-left">
            {!sidebarOpen && (
              <button className="icon-button" onClick={() => setSidebarOpen(true)}>
                ☰
              </button>
            )}
            <h1 className="conversation-title">{activeConversation?.name}</h1>
          </div>
        </div>

        {/* Tab bar */}
        {activeConversation && (
          <div className="tab-bar">
            <div className="tabs">
              {activeConversation.tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`tab ${tab.id === activeConversation.activeTabId ? 'active' : ''}`}
                  onClick={() => switchTab(tab.id)}
                >
                  <span className="tab-name">{tab.name}</span>
                  {activeConversation.tabs.length > 1 && (
                    <button
                      className="close-tab"
                      onClick={(e) => closeTab(tab.id, e)}
                    >
                      ×
                    </button>
                  )}
                </div>
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
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? 'DL' : 'AI'}
                  </div>
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>How can I help you today?</h2>
              <p>Start a conversation in this tab</p>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="input-container">
          <form onSubmit={sendMessage} className="input-form">
            <input
              type="text"
              className="message-input"
              placeholder="Message Claude..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="send-button" disabled={!inputValue.trim()}>
              ↑
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
