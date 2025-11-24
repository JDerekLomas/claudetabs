# Claude Tabs Demo

An interactive demonstration of a redesigned Claude interface with tabbed conversations.

## Concept

This demo showcases how Claude could be redesigned to support multiple tabs within a single conversation, allowing users to manage parallel conversation threads or topics more effectively.

### Key Features

- **Conversation Management**: Create and manage multiple conversations
- **Tabbed Interface**: Each conversation can have multiple tabs for different topics or contexts
- **Auto-naming**: New conversations are automatically named based on the first message
- **Tab Count Badge**: Conversations with multiple tabs show a badge indicating the number of tabs
- **Interactive**: Fully functional demo with message sending, tab switching, and tab management

## How to Use

### Installation

```bash
npm install
```

### Running the Demo

```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

## Features Demonstrated

### 1. Creating New Conversations
- Click the "New Chat" button in the sidebar
- The conversation is initially named "New Chat"
- After the first message is sent, the conversation is automatically renamed based on that message

### 2. Managing Tabs
- **Add Tab**: Click the "+" button in the tab bar to create a new tab within the current conversation
- **Switch Tabs**: Click on any tab to switch to it
- **Close Tab**: Click the "×" button on a tab to close it (cannot close the last tab)
- Each tab maintains its own conversation history

### 3. Sidebar Features
- View all conversations
- See how many tabs each conversation has
- Toggle sidebar visibility with the menu button
- Click on any conversation to switch to it

### 4. Messaging
- Type a message in the input field at the bottom
- Press Enter or click the send button to send
- Each tab maintains its own conversation thread
- Messages are displayed with user and assistant avatars

## Technical Stack

- **React**: UI framework
- **Vite**: Build tool and dev server
- **CSS**: Custom styling to match Claude's interface design

## Design Choices

1. **Tab-based Organization**: Each conversation can have multiple tabs, allowing users to explore different topics or approaches within the same conversation context

2. **Visual Hierarchy**:
   - Conversations in the sidebar
   - Tabs within each conversation
   - Messages within each tab

3. **Conversation Naming**: Automatically names conversations based on the first message, making it easy to identify conversations at a glance

4. **Tab Count Indicator**: Shows users which conversations have multiple tabs without having to open them

## Future Enhancements

This demo could be extended with:
- Drag and drop to reorder tabs
- Tab renaming functionality
- Keyboard shortcuts for tab navigation
- Export/share individual tabs
- Search within tabs
- Tab templates for common use cases
- Persistence with localStorage or backend integration
- Real Claude API integration

## Project Structure

```
claudetabs/
├── src/
│   ├── App.jsx          # Main application component with all logic
│   ├── App.css          # Styling for the application
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## License

This is a demonstration project for showcasing the concept of tabbed conversations in Claude.
