# Claude Tabs

## Supporting Curiosity-Driven Learning While Vibecoding

What if Claude vibecoding sessions could be supplemented with links that allowed users to explore technical concepts in parallel tabs within the Claude Web UI?

The goal of **Claude Tabs** is to support curiosity-driven "Deep Dives" to supplement human understanding while conducting AI work, particularly vibecoding.

## Concept

While vibecoding, you can open up new tabs to learn more about the software libraries or design approach—supporting intrinsically motivated learning.

**Claude Tabs supports the flow of curiosity around the flow of work.**

## Key Features

### Learning Mode

With learning mode on, when you ask Claude to perform a task—like create some vibecoded software—Claude will highlight key technical terms weighted toward your learning goals (as expressed in your editable learner profile).

**Learning Links** use the `[[term]]` syntax to highlight relevant concepts. Clicking opens a Deep Dive tab with a streaming explanation from Claude Haiku for fast response times. Learning links are weighted toward the learner's stated interests and goals.

### Per-Chat Tabs

Each chat maintains its own set of tabs. When you switch between chats in the sidebar, the tabs associated with that chat are preserved. This keeps your Deep Dives organized by context.

- Open multiple Deep Dive tabs per conversation
- Artifact previews open as tabs
- Tabs persist when switching between chats
- Close tabs to return to main chat

### Text Selection Deep Dive

Highlight any text in a message and click "Deep Dive" to open a learning tab about that topic. Context from your main chat is passed to disambiguate technical terms.

### React Artifacts

Code blocks with `jsx`, `tsx`, `react`, or `html` languages show a "Preview" button. Click to open a live Sandpack preview as a tab with:

- Code/Split/Preview view modes
- Available libraries: lucide-react, recharts, framer-motion, date-fns, lodash, mathjs
- Tailwind CSS support via CDN
- Fullscreen mode

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Opt + ←/→** | Navigate between tabs |
| **Opt + ↑** | Open new learning tab |
| **Opt + ↓** | Close current tab (if not main) |

## Settings

Access settings via the graduation cap icon in the sidebar:

### Learner Profile Tab
- **Your Background**: Your experience and expertise
- **Aspirations**: What you want to achieve
- **Learning Goals**: Specific things you want to learn

Claude uses this profile to:
1. Weight learning links toward your interests
2. Adapt explanations to your level
3. Connect concepts to your goals

### System Prompts Tab
View the system prompts used for:
- Main chat (with Learning Mode)
- Deep Dive explanations
- Side conversations

## How to Use

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

### Deploying to Vercel

This project is configured for Vercel deployment with serverless API integration.

1. Connect your GitHub repository to Vercel
2. Set the `ANTHROPIC_API_KEY` environment variable in Vercel project settings
3. Deploy

## Technical Stack

- **React** with hooks for state management
- **Tailwind CSS** for styling
- **Sandpack** for live React code previews
- **KaTeX** for LaTeX math rendering
- **Lucide React** for icons
- **Claude API** via Vercel Edge functions with streaming
  - Sonnet 4 for main chat
  - Haiku for Deep Dives and side conversations
- **Vite** for build tooling

## Project Structure

```
claudetabs/
├── api/
│   └── chat.js              # Vercel serverless function for Claude API
├── src/
│   ├── App.jsx              # Main application with all features
│   ├── components/
│   │   ├── ArtifactPreview.jsx   # Sandpack-based React preview
│   │   └── MarkdownRenderer.jsx  # Markdown with learning links + LaTeX
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── index.html               # HTML template
├── vercel.json              # Vercel configuration
├── tailwind.config.js       # Tailwind configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## API Integration

The app uses a Vercel serverless function (`/api/chat`) that:
- Handles streaming responses from Claude API
- Keeps API key secure server-side
- Supports model selection (Sonnet for main, Haiku for side chats)
- Uses `[[term]]` syntax for learning links
- Supports up to 8192 tokens per response

## Architecture Notes

### Per-Chat State
Each chat stores:
- `title`: Chat name (auto-generated from first message)
- `messages`: Conversation history
- `tabs`: Array of tabs (main chat, Deep Dives, artifacts)
- `activeTabId`: Currently selected tab

### Stale Closure Prevention
Uses `useRef` to track `activeChatId` for async operations, ensuring tabs are added to the correct chat even during streaming responses.

### Event Delegation for Learning Links
Learning links use `mousedown` event delegation to fire immediately before React re-renders during streaming, preventing missed clicks.

## Design Philosophy

The interface matches Claude's production design while adding innovative learning features:
- Warm cream background (#F4F4F2)
- Coral orange accents (#D97757) for learning mode
- Clean typography with serif fonts for AI responses
- Subtle animations and transitions
- Mobile-responsive layout

## Future Enhancements

- Voice-based side conversations
- Persistent learning history and knowledge base
- Export learning paths
- Collaborative learning sessions
- Integration with external knowledge sources
- Advanced concept mapping

## Demo

Visit the live demo at: [https://claudetabs.vercel.app/](https://claudetabs.vercel.app/)

---

**Claude Tabs** - Where curiosity meets productivity.
