# Claude Tabs

## Supporting Curiosity-Driven Learning While Vibecoding

What if Claude vibecoding sessions could be supplemented with links that allowed users to explore technical concepts in parallel tabs within the Claude Web UI?

The goal of **Claude Tabs** is to support curiosity-driven "Deep Dives" to supplement human understanding while conducting AI work, particularly vibecoding.

## Concept

While vibecoding, you can open up new tabs to learn more about the software libraries or design approach—supporting intrinsically motivated learning.

**Claude tabs supports the flow of curiosity around the flow of work.**

## Key Features

### Learning Mode

With learning mode on, when you ask Claude to perform a task—like create some vibecoded software—Claude will highlight key technical terms and generally support your learning goals—as expressed (and editable) in your learner profile.

**Learning Links** highlight relevant concepts for further learning. Clicking those links opens a new tab with about 50 words that are generated at the time of the highlight for instant gratification of curiosity. A fast first token model then completes the resource page.

Learning links provide immediate curiosity satisfaction without disrupting the flow of the main task.

### Tabs Organization

Tabs within Claude help organize multiple Claude conversations into a single main chat.

**Side conversations**: Faster, cheaper models. But also voice-based side conversations. Side conversations have the summarized context of the main chat but the transcripts of the side conversation are not in the context of the main chat. This keeps context clean and reduces the number of chats created by power users. It also creates a personal knowledge base based on an individual's curiosity.

### Text Selection Deep Dive

With Claude Tabs, you can also highlight any text to "Learn More"—so you can dive deep on anything in a side conversation.

**Keep Learning.**

### Keyboard Shortcuts

- **Opt + ←/→**: Navigate between tabs
- **Opt + ↑**: Open new learning tab
- **Opt + ↓**: Close current tab (if not main)

## Product Notes

Currently, Claude Tabs is only available in learning mode. From a product perspective, learning mode is a great place to try out new UI possibilities because users would expect additional features and support—but the stakes are lower than a full platform release.

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

## Features

### 1. Main Chat
- Standard Claude conversation interface
- Auto-naming based on first message
- Real-time streaming responses
- Learning mode toggle to enable/disable concept highlighting

### 2. Learning Tabs
- Click [[learning links::with inline definitions]] in responses to open deep dive tabs
- Each learning tab provides:
  - Instant summary from the inline definition
  - Full streaming explanation
  - Related concepts to explore
  - Side conversation thread

### 3. React Artifacts
- Live preview of React/JSX code blocks with Sandpack
- Available libraries: lucide-react, recharts, framer-motion, date-fns, lodash, mathjs
- Tailwind CSS support via CDN
- Code/Split/Preview view modes
- Artifacts open as tabs for full-screen experience

### 4. Text Selection
- Highlight any text in messages
- Click "Deep Dive" to open a learning tab about that topic
- Contextual learning on demand

### 5. Learning Profile
- Customize your interests and learning preferences
- Claude adapts explanations based on your profile
- Accessible via Settings in sidebar

### 6. Keyboard Navigation
- Fast tab switching with Option + arrow keys
- Quick access to new learning tabs
- Efficient workflow for power users

## Technical Stack

- **React** with hooks for state management
- **Tailwind CSS** for styling
- **Sandpack** for live React code previews
- **Lucide React** for icons
- **Claude API** (Sonnet) via Vercel Edge functions with streaming
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
│   │   └── MarkdownRenderer.jsx  # Markdown with learning links
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
- Supports both main chat and learning tab conversations
- Uses [[term::definition]] syntax for inline learning links

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
