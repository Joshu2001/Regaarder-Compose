---
name: draggable-glassmorphism-window
description: Architectural guidelines and code patterns for building Apple-style Draggable Floating Windows with frosted glassmorphism effects (e.g. Meeting Notes panel).
---

# Draggable Glassmorphism Window Architecture

When building floating panels or UI overlays (like Meeting Notes, Widgets, or Tools) in the Regaarder application, you must prioritize **progressive disclosure** and an **Apple-style aesthetic**.

## Core Principles
1. **Never use fixed, screen-blocking modals unless absolutely necessary.** Replace them with floating, draggable windows.
2. **Use Frosted Glassmorphism.** Floating panels must feel premium, using backdrop blurs and subtle translucency.
3. **Standalone State.** The window should manage its own dragging state so it doesn't crash the app if global libraries are missing. Do not use `<Draggable>` unless confirmed to be imported and supported.

## Code Pattern Template

Use the following pattern to create a draggable floating window. Notice how it implements local state for dragging rather than relying on external libraries that may be undefined.

```jsx
const DraggableFloatingWindow = ({ isOpen, onClose, title }) => {
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e) => {
    // Ignore drag if clicking interactive elements or explicitly marked no-drag areas
    if (e.target.closest('.no-drag, input, textarea, button, select')) return;
    
    setIsDragging(true);
    const handlePointerMove = (moveEvent) => {
      setPos(prev => ({
        x: prev.x + moveEvent.movementX,
        y: prev.y + moveEvent.movementY
      }));
    };
    
    const handlePointerUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-[100000] animate-in fade-in shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-2xl flex flex-col bg-white/70 backdrop-blur-xl border border-white/40"
      style={{ width: '400px', height: '500px', left: pos.x, top: pos.y }}
    >
      {/* Draggable Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-white/30 bg-white/40 rounded-t-2xl cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
      >
        <h2 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
          {title}
        </h2>
        
        {/* Actions - MUST have .no-drag class */}
        <div className="flex items-center gap-2 no-drag">
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 overflow-y-auto no-drag">
        {/* Your content here */}
      </div>
    </div>
  );
};
```

## Key Styling Tokens
- **Container shadow:** `shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]`
- **Glassmorphism body:** `bg-white/70 backdrop-blur-xl border border-white/40`
- **Header bg:** `bg-white/40 rounded-t-2xl`
- **Border separator:** `border-b border-white/30`
- **Text:** `text-[15px] font-semibold text-slate-800`
