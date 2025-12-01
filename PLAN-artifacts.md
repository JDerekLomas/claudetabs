# ClaudeTabs Artifacts Enhancement Plan

## Current State
- Sandpack-based React preview
- Only React + Tailwind CSS (via CDN)
- Single file (App.js + styles.css)
- Code wrapping for incomplete snippets
- View modes: code / split / preview

---

## Phase 1: Library Support

### Add dependencies to Sandpack
```javascript
customSetup: {
  dependencies: {
    "lucide-react": "0.263.1",
    "recharts": "2.5.0",
    "mathjs": "11.8.0",
    "lodash": "4.17.21",
    "framer-motion": "10.16.0",
    "date-fns": "2.30.0"
  }
}
```

### Why these?
- **lucide-react**: Icons (already used in main app)
- **recharts**: Charts/graphs (common request)
- **mathjs**: Math operations
- **lodash**: Utilities
- **framer-motion**: Animations
- **date-fns**: Date formatting

### Skip for now:
- Three.js (heavy, complex setup)
- d3 (steep learning curve)
- Tone.js (niche audio use case)

---

## Phase 2: Better Code Detection

### Current `wrapCode` issues:
1. Doesn't detect hooks imports
2. Doesn't handle multiple components
3. HTML wrapping uses dangerous innerHTML

### Improved detection:
```javascript
const wrapCode = (code, language) => {
  // Already complete component
  if (code.includes('export default')) return code;

  // Has component definition but no export
  if (/function\s+[A-Z]\w*/.test(code)) {
    const match = code.match(/function\s+([A-Z]\w*)/);
    return code + `\n\nexport default ${match[1]};`;
  }

  // Detect needed imports from code
  const imports = [];
  if (/useState|useEffect|useRef|useMemo/.test(code)) {
    const hooks = code.match(/use[A-Z]\w+/g) || [];
    imports.push(`import { ${[...new Set(hooks)].join(', ')} } from 'react';`);
  }
  if (code.includes('<') && /[A-Z]/.test(code)) {
    // Detect lucide icons
    const icons = code.match(/<([A-Z][a-z]+)(?:\s|\/|>)/g) || [];
    // ... detect and add lucide imports
  }

  // Wrap JSX fragment
  return `${imports.join('\n')}

export default function App() {
  return (
    <>
      ${code}
    </>
  );
}`;
};
```

---

## Phase 3: Artifact Types Beyond React

### SVG Support
- Detect `<svg` in code blocks
- Render directly in an iframe/div (no Sandpack needed)
- Simpler, faster

### HTML Support
- Detect pure HTML (no JSX)
- Use iframe with srcdoc
- Include Tailwind CDN

### Mermaid Diagrams
- Add mermaid.js library
- Detect ```mermaid code blocks
- Render to SVG

### Implementation:
```javascript
// In MarkdownRenderer, detect artifact type:
const getArtifactType = (language, code) => {
  if (language === 'mermaid') return 'mermaid';
  if (language === 'svg' || code.trim().startsWith('<svg')) return 'svg';
  if (language === 'html' && !code.includes('className')) return 'html';
  if (['jsx', 'tsx', 'react'].includes(language)) return 'react';
  return null; // Not previewable
};
```

---

## Phase 4: Error Handling

### Current issues:
- Sandpack errors not surfaced well
- No fallback for broken code
- No "try again" option

### Add:
1. Error boundary around preview
2. Clear error messages
3. "Copy code" still works when preview fails
4. Syntax error highlighting

---

## Phase 5: System Prompt Alignment

### Update main chat prompt:
```javascript
REACT ARTIFACTS:
Create complete, runnable React components with:
- Default export: \`export default function Name()\`
- Explicit imports: \`import { useState } from 'react'\`
- Tailwind CSS for styling
- Available: lucide-react, recharts, framer-motion, date-fns, lodash, mathjs

Constraints:
- NO localStorage/sessionStorage
- NO external API calls (CORS)
- NO file system access
- Single component per artifact

Design principles:
- Modern aesthetics (gradients, shadows, rounded corners)
- Hover effects and micro-animations
- Responsive (works on mobile)
- Accessible (proper contrast, semantic HTML)
```

---

## Phase 6: Learning Link Integration

### Switch from `%%term%%` to `[[term::definition]]`

**Parser in MarkdownRenderer:**
```javascript
const processLearningLinks = (text, onLinkClick) => {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return parts.map((part, i) => {
    const match = part.match(/\[\[([^:]+)::([^\]]+)\]\]/);
    if (match) {
      const [, term, definition] = match;
      return (
        <LearningLink
          key={i}
          term={term}
          definition={definition}
          onClick={() => onLinkClick(term)}
        />
      );
    }
    return part;
  });
};
```

**LearningLink component:**
- Shows term inline with subtle underline
- Tooltip shows definition on hover
- Click opens Deep Dive tab

**Benefits:**
- No extra API call for summaries
- Definition available immediately
- Main model generates context-aware definitions

---

## Priority Order

1. **Phase 5** - Fix system prompt (quick win, big impact)
2. **Phase 1** - Add libraries (enables charts, icons)
3. **Phase 6** - Learning links (core differentiator)
4. **Phase 2** - Better code wrapping (reduces errors)
5. **Phase 4** - Error handling (better UX)
6. **Phase 3** - Other artifact types (nice to have)

---

## Estimated Changes

| File | Changes |
|------|---------|
| `App.jsx` | System prompts, remove pre-generation |
| `ArtifactPreview.jsx` | Add dependencies, improve wrapping |
| `MarkdownRenderer.jsx` | Add `[[term::def]]` parser |
| New: `LearningLink.jsx` | Tooltip component |
| New: `SvgPreview.jsx` | Simple SVG renderer |
| New: `MermaidPreview.jsx` | Mermaid diagram renderer |
