# ArchFlow 📐

> A focused developer workspace for designing, visualizing, and documenting software architecture and system design.

---

## 🌟 Highlights

- **Infinite Architecture Canvas:** Dot-grid canvas with cursor proximity lighting, spacebar pan, trackpad gesture navigation, and smooth zoom (10% to 500%).
- **System Design Component Palette:**
  - **Basic Shapes:** Rectangles, Rounded Rectangles, Circles, Decision Diamonds.
  - **Architecture Components:** API Gateways, Microservices, Databases, Message Queues, In-Memory Caches, Client/Frontend nodes.
  - **Containers & Annotations:** VPC & Cluster Grouping boxes, freeform text annotations.
- **Smart Edge Routing & Waypoints:**
  - Straight, Curved (Bézier), and Orthogonal 90° Manhattan routing.
  - Custom multi-waypoint placement via <kbd>Alt</kbd> + drag.
  - Directional, bidirectional, open-arrow, and diamond marker styles.
  - Midpoint connection label badges.
- **Light & Dark Theme:** Built-in theme switcher supporting curated developer palettes (`#F8FAFC`, `#0F172A`, `#2563EB`, `#16A34A`, `#E2E8F0`).
- **Interactive Minimap:** Real-time diagram radar with click-to-center navigation.
- **Persistence & Exports:**
  - Standalone vector SVG export (with background or transparent).
  - ArchFlow JSON schema export & import.
  - Automatic workspace persistence with legacy format backward compatibility.
- **Keyboard-First Workflow:** Full suite of hotkeys (<kbd>Space</kbd>+Drag, <kbd>Ctrl</kbd>+<kbd>S</kbd>, <kbd>Ctrl</kbd>+<kbd>0</kbd>, <kbd>Delete</kbd>, <kbd>Ctrl</kbd>+Click multi-select).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn

### Installation & Development

```bash
# Navigate to the frontend directory
cd Frontend

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build

```bash
# Build the optimized production bundle
npm run build

# Preview the production build
npm run preview
```

---

## ⌨️ Keyboard & Interaction Shortcuts

| Shortcut | Description |
|---|---|
| <kbd>Space</kbd> + Drag | Pan around the infinite canvas |
| <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + Scroll | Zoom in / out around cursor |
| <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>0</kbd> | Reset canvas zoom to 100% |
| Drag on Canvas | Marquee multi-selection box |
| <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + Click | Toggle multi-select individual elements |
| Click Connection Handle | Draw connection line to another component |
| <kbd>Alt</kbd> + Drag Handle | Multi-waypoint orthogonal routing mode |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Remove selected elements |
| <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>S</kbd> | Quick-save diagram to local workspace |

---

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite 5
- **Styling:** Tailwind CSS 3 + CSS Variables
- **Rendering Engine:** Native Canvas 2D + Dynamic SVG DOM
- **Typography:** Inter

---

## 📄 License

MIT
