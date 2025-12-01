# Split View & Streaming Deep Dives Plan

## Current Issues
1. **Deep Dives don't stream** - Text appears all at once after loading
2. **Artifacts open in modal** - Should display in right panel like Claude
3. **Artifact preview too small** - Even with fixes, modal approach is clunky

---

## Target Layout (Like Claude)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Sidebar] │        Chat Area         │    Artifact Panel       │
│           │                          │                         │
│  52px     │  Messages stream here    │  Live preview here      │
│  icons    │                          │                         │
│           │  Learning links in text  │  Code/Split/Preview     │
│           │                          │  view toggles           │
│           │                          │                         │
│           │  ───────────────────     │  Sandpack preview       │
│           │  [Input box]             │                         │
│           │                          │  [Close X]              │
└─────────────────────────────────────────────────────────────────┘
```

When no artifact is active, chat area takes full width.

---

## Changes Required

### 1. Streaming Deep Dives
**File: `App.jsx`**

Current `fetchConceptData` fetches all text, then updates tab.
Change to stream like `handleSendMessage`:

```javascript
const fetchConceptData = async (term, tabId, initialDefinition) => {
  // Update tab to show streaming started
  setTabs(prev => prev.map(t =>
    t.id === tabId ? { ...t, loading: false } : t
  ));

  const response = await fetch('/api/chat', { ... });
  const reader = response.body.getReader();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Parse SSE chunks
    // Update tab content in real-time
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

  // Parse RELATED section at end
};
```

### 2. Right-Side Artifact Panel
**File: `App.jsx`**

Replace modal approach with persistent right panel:

```jsx
<div className="flex-1 flex overflow-hidden">
  {/* Main chat/content area */}
  <div className={`flex-1 flex flex-col ${activeArtifact ? 'w-1/2' : 'w-full'} transition-all`}>
    {renderActiveTabContent()}
    {/* Input area */}
  </div>

  {/* Artifact panel - slides in from right */}
  {activeArtifact && (
    <div className="w-1/2 border-l border-[#E6E4DD] flex flex-col bg-white">
      <ArtifactPreview
        code={activeArtifact.code}
        language={activeArtifact.language}
        title={activeArtifact.title}
        onClose={() => setActiveArtifact(null)}
        embedded={true}  // New prop for embedded mode
      />
    </div>
  )}
</div>
```

### 3. Update ArtifactPreview for Embedded Mode
**File: `ArtifactPreview.jsx`**

Add `embedded` prop that:
- Removes modal-specific styles
- Makes it fill parent container
- Keeps header with close button
- Full height Sandpack

```jsx
export default function ArtifactPreview({
  code,
  language = 'jsx',
  title = 'Preview',
  onClose,
  embedded = false  // NEW
}) {
  const containerClass = embedded
    ? 'flex flex-col h-full'  // Fill parent
    : isFullscreen
      ? 'fixed inset-0 z-[100] bg-white'
      : 'relative rounded-xl overflow-hidden border border-[#E6E4DD] shadow-lg';

  const sandpackHeight = embedded
    ? 'flex-1'  // Fill remaining space
    : isFullscreen
      ? 'h-[calc(100vh-48px)]'
      : 'h-[70vh] min-h-[400px]';
```

### 4. Auto-Open Artifact from Code Blocks
**File: `MarkdownRenderer.jsx`**

When streaming completes and there's a JSX code block, auto-open it:

```javascript
// In CodeBlock component or parent
useEffect(() => {
  if (isArtifact && autoOpen) {
    onRunArtifact(code, language);
  }
}, [code, isArtifact]);
```

Or simpler: Add "Open in Panel" button that's more prominent than current "Preview" button.

---

## Implementation Order

1. **Streaming Deep Dives** (highest impact, independent)
   - Modify `fetchConceptData` to stream
   - Update tab content progressively
   - ~30 min

2. **Right-side artifact panel** (layout change)
   - Restructure main layout
   - Add `embedded` mode to ArtifactPreview
   - Remove modal code
   - ~45 min

3. **Polish**
   - Smooth transitions
   - Responsive behavior (stack on mobile)
   - Auto-open artifacts option
   - ~20 min

---

## Responsive Considerations

On mobile/narrow screens:
- Artifact panel could slide up from bottom (like a sheet)
- Or use modal as fallback
- Check `window.innerWidth` or use Tailwind breakpoints

```jsx
{activeArtifact && (
  <>
    {/* Desktop: side panel */}
    <div className="hidden md:flex w-1/2 ...">
      <ArtifactPreview embedded />
    </div>

    {/* Mobile: modal */}
    <div className="md:hidden fixed inset-0 ...">
      <ArtifactPreview />
    </div>
  </>
)}
```

---

## Questions to Decide

1. **Should artifacts auto-open?** Or require user click?
2. **Panel width** - Fixed 50%? Or resizable?
3. **Multiple artifacts** - Queue them? Or replace?
4. **Deep Dive + Artifact** - Can both be open? (Deep Dive in tab, artifact in panel)
