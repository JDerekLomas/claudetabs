# Claude Tabs

## Supporting Curiosity-Driven Learning While Vibecoding

What if Claude vibecoding sessions could be supplemented with links that allowed users to explore technical concepts in parallel tabs within the Claude Web UI?

The goal of **Claude Tabs** is to support curiosity-driven "Deep Dives" to supplement human understanding while conducting AI work, particularly vibecoding.

## Concept

While vibecoding, you can open up new tabs to learn more about the software libraries or design approach—supporting intrinsically motivated learning.

**Claude Tabs supports the flow of curiosity around the flow of work.**

## Key Features

### Learning Mode

With learning mode on, when you ask Claude to perform a task—like create some vibecoded software—Claude will highlight key concepts worth exploring deeper. These aren't limited to technical terms—they can include design principles, historical context, cognitive concepts, or any idea with interesting depth.

**Learning Links** use the `[[term]]` syntax to highlight relevant concepts. Clicking opens a Deep Dive tab with a streaming explanation from Claude Haiku for fast response times.

### Learning History

Claude Tabs tracks the concepts you explore in Deep Dive tabs. This learning history is:
- Included in your learner profile so Claude knows what you've already studied
- Persisted across sessions (via localStorage and Supabase cloud sync)
- Used to avoid re-explaining concepts you've already explored

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

## Data Persistence

Claude Tabs stores your data in two places:

### localStorage (Instant)
- Chat history
- User profile
- Learning mode settings
- Learning history
- Works offline, device-specific

### Supabase (Cloud Sync)
- All data syncs to cloud with 2-second debounce
- Access your data from any device
- Falls back gracefully if unavailable

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

## Installation

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then open your browser to `http://localhost:5173`

### Environment Variables

Create a `.env` file for local development:

```env
ANTHROPIC_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deploying to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel project settings:
   - `ANTHROPIC_API_KEY` - Your Anthropic API key
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
3. Deploy

### Supabase Setup

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create the required tables:
- `user_profiles` - Learner profiles
- `chats` - Chat history
- `learning_history` - Concepts explored
- `user_settings` - Learning mode, active chat, etc.

## Technical Stack

- **React** with hooks for state management
- **Tailwind CSS** for styling
- **Sandpack** for live React code previews
- **KaTeX** for LaTeX math rendering
- **Lucide React** for icons
- **Supabase** for cloud data persistence
- **Claude API** via Vercel Edge functions with streaming
  - Sonnet 4 for main chat
  - Haiku for Deep Dives and side conversations
- **Vite** for build tooling

## Project Structure

```
claudetabs/
├── api/
│   ├── chat.js              # Claude API serverless function
│   └── mcq.js               # MCQMCP quiz integration
├── src/
│   ├── App.jsx              # Main application
│   ├── components/
│   │   ├── ArtifactPreview.jsx   # Sandpack React preview
│   │   └── MarkdownRenderer.jsx  # Markdown + learning links + LaTeX
│   ├── utils/
│   │   ├── supabase.js      # Supabase client and sync functions
│   │   └── mcqmcp.js        # Quiz/MCP utilities
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── supabase-schema.sql      # Database schema
├── vercel.json              # Vercel configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json             # Dependencies and scripts
```

## API Integration

### Claude API (`/api/chat`)
- Streaming responses from Claude
- Server-side API key security
- Model selection (Sonnet for main, Haiku for side chats)
- Up to 8192 tokens per response

### MCQMCP Integration (`/api/mcq`)
- Quiz generation for learning objectives
- Answer recording and mastery tracking
- Fallback to Claude-generated questions

## Architecture Notes

### Per-Chat State
Each chat stores:
- `title`: Chat name (auto-generated from first message)
- `messages`: Conversation history
- `tabs`: Array of tabs (main chat, Deep Dives, artifacts)
- `activeTabId`: Currently selected tab

### Data Sync Strategy
1. Load from localStorage immediately (fast)
2. Load from Supabase and merge (cloud wins if exists)
3. Save to both on changes (debounced 2s for Supabase)

### Stale Closure Prevention
Uses `useRef` to track `activeChatId` for async operations, ensuring tabs are added to the correct chat even during streaming responses.

## Design Philosophy

The interface matches Claude's production design while adding innovative learning features:
- Warm cream background (#F4F4F2)
- Coral orange accents (#D97757) for learning mode
- Clean typography with serif fonts for AI responses
- Subtle animations and transitions
- Mobile-responsive layout

## Demo

Visit the live demo at: [https://claudetabs.vercel.app/](https://claudetabs.vercel.app/)

---

**Claude Tabs** - Where curiosity meets productivity.
