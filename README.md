# 🔬 X-Ray Debugger

A production-ready debugging system for non-deterministic AI pipelines. Built with **Next.js 16**, **TypeScript**, and **React 19**.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

## 📋 Overview

X-Ray Debugger provides complete visibility into AI pipeline execution by logging each step's inputs, outputs, and reasoning. It features a modern enterprise-grade dashboard UI with glassmorphism design, interactive filtering, funnel analysis, and focus mode for debugging failures.

### Key Features

- **📊 Trace Visualization** – View complete pipeline executions with expandable step details
- **🎯 Pipeline Funnel** – Visual funnel showing candidate flow through pipeline stages with progress bars
- **🔍 Filter Visualizer** – Table view of filter evaluations with pass/fail indicators and copy buttons
- **💡 Reasoning Boxes** – Amber-highlighted reasoning sections for each pipeline step
- **📝 JSON Viewer** – Syntax-highlighted inputs/outputs with copy-to-clipboard functionality
- **🌓 Dark/Light Mode** – Toggle between themes with full design system support
- **⚠️ Error Filtering** – "Show Errors Only" toggle to focus on failed traces
- **🔌 Storage Adapters** – Pluggable storage backends (File, Memory, PostgreSQL)
- **✅ Success Banner** – Visual confirmation when all pipeline steps complete successfully

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Navigate to the project
cd xray-debugger-next

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 📁 Project Structure

```
xray-debugger-next/
├── app/
│   ├── api/                    # API routes
│   │   └── traces/             # Traces API endpoint
│   ├── page.tsx                # Main dashboard (modular component integration)
│   ├── layout.tsx              # Root layout with theme support
│   └── globals.css             # Enterprise design system (colors, animations)
├── components/
│   ├── debug/                  # Debug-specific components
│   │   ├── Header.tsx          # App header with theme toggle & trace count
│   │   ├── TraceSidebar.tsx    # Trace history sidebar with error filter
│   │   ├── TraceCard.tsx       # Individual trace card with status dots
│   │   ├── TraceDetail.tsx     # Main trace view with header & steps
│   │   ├── StepCard.tsx        # Collapsible step with reasoning box
│   │   ├── PipelineFunnel.tsx  # Visual candidate flow diagram
│   │   ├── JsonViewer.tsx      # Syntax-highlighted JSON display
│   │   ├── CandidateTable.tsx  # Filter evaluation results table
│   │   ├── EmptyState.tsx      # Empty state displays
│   │   └── SuccessBanner.tsx   # Success notification banner
│   └── ui/                     # Shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── collapsible.tsx
│       ├── label.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       └── tooltip.tsx
├── types/
│   └── trace.ts                # TypeScript type definitions for traces
├── lib/
│   ├── utils.ts                # Utility functions (cn, etc.)
│   └── transformers.ts         # API data transformation layer
├── src/
│   ├── lib/
│   │   ├── xray.ts             # Type-safe SDK with generics
│   │   └── storage.ts          # Storage adapter pattern
│   └── types.ts                # SDK type definitions
├── scripts/
│   └── generate-data.ts        # Demo data generator
├── data/
│   └── traces.json             # Persisted trace data (6 traces, 2 failed)
└── public/                     # Static assets
```

---

## 🎨 Design System

The UI implements an enterprise-grade design system with:

### Color Tokens

| Token       | Light Mode | Dark Mode | Usage                             |
| ----------- | ---------- | --------- | --------------------------------- |
| Primary     | `#3b82f6`  | `#3b82f6` | Buttons, badges, progress bars    |
| Success     | `#22c55e`  | `#22c55e` | Completed status, success banners |
| Destructive | `#ef4444`  | `#ef4444` | Failed status, error indicators   |
| Reasoning   | `#f59e0b`  | `#f59e0b` | Reasoning box borders             |

### Visual Features

- **Glassmorphism** – Semi-transparent cards with backdrop blur
- **Header Glow** – Blue gradient effect on the header
- **Status Glows** – Success/error indicators with colored shadows
- **Smooth Animations** – fade-in, slide-in-left, scale-in effects
- **Custom Scrollbars** – Styled to match theme

---

## 🧩 Component Architecture

### Debug Components

| Component        | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `Header`         | App header with logo, theme toggle, and trace count badge |
| `TraceSidebar`   | Trace list with "Show Errors Only" filter toggle          |
| `TraceCard`      | Trace summary with status dot and step progress bars      |
| `TraceDetail`    | Full trace view with header, funnel, and step list        |
| `StepCard`       | Expandable step with icon, status badge, and reasoning    |
| `PipelineFunnel` | Visual flow: Candidates → Passed Filters → Selected       |
| `JsonViewer`     | Syntax-highlighted JSON with copy functionality           |
| `CandidateTable` | Filter evaluation table with pass/fail styling            |
| `EmptyState`     | Messages for no traces / no errors states                 |
| `SuccessBanner`  | Green banner for successful pipeline completion           |

### UI Components (Shadcn/ui)

- `Badge` – Status indicators
- `Button` – Theme toggle, actions
- `Collapsible` – Expandable step cards
- `Switch` – Error filter toggle
- `Table` – Candidate evaluation display
- `Tooltip` – Hover information

---

## 📊 Sample Trace Data

The application includes 6 sample traces demonstrating various scenarios:

| Trace | Product                      | Status     | Scenario                            |
| ----- | ---------------------------- | ---------- | ----------------------------------- |
| #001  | Stainless Steel Water Bottle | ✅ Success | All steps pass, competitor selected |
| #002  | Wireless Bluetooth Earbuds   | ✅ Success | Full pipeline completion            |
| #003  | Yoga Mat Premium             | ✅ Success | 50 candidates, 23 pass filters      |
| #004  | Mechanical Gaming Keyboard   | ❌ Failed  | All candidates fail strict filters  |
| #005  | Fitness Smart Watch          | ❌ Failed  | API rate limit error                |
| #006  | Automatic Coffee Maker       | ✅ Success | 6 of 10 candidates pass             |

---

## 🛠️ SDK Usage

### Basic Example

```typescript
import XRaySDK from "./src/lib/xray";

const xray = XRaySDK.getInstance();

// Start a new trace
xray.startTrace("trace-001", "Product Analysis Pipeline");

// Add type-safe steps
xray.addStep<{ productName: string }, { keywords: string[] }>({
  stepName: "Keyword Generation",
  input: { productName: "Wireless Headphones" },
  output: { keywords: ["bluetooth", "audio", "headphones"] },
  reasoning: "Generated 3 keywords based on product category",
  status: "success",
});

// Save the trace
await xray.save();
```

### Custom Storage Adapter

```typescript
import XRaySDK from "./src/lib/xray";
import { MemoryStorageAdapter } from "./src/lib/storage";

const storage = new MemoryStorageAdapter();
const xray = XRaySDK.getInstance(storage);
```

---

## 🔌 Storage Adapters

| Adapter                  | Use Case                     | Status            |
| ------------------------ | ---------------------------- | ----------------- |
| `FileStorageAdapter`     | Local development, CLI tools | ✅ Implemented    |
| `MemoryStorageAdapter`   | Unit testing                 | ✅ Implemented    |
| `PostgresStorageAdapter` | Production databases         | 📋 Interface only |

---

## 📦 Tech Stack

| Category        | Technology                           |
| --------------- | ------------------------------------ |
| Framework       | Next.js 16.1.1 (App Router)          |
| Language        | TypeScript 5                         |
| UI Library      | React 19.2.3                         |
| Styling         | Tailwind CSS 4, custom CSS variables |
| Components      | Shadcn/ui, Radix UI primitives       |
| Icons           | Lucide React                         |
| Date Formatting | date-fns                             |

---

## 📝 Available Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## 🔄 Recent Updates

### Frontend Migration (v2.0)

Migrated from monolithic architecture to modular component design:

- **Refactored** `page.tsx` from 812 lines to ~150 lines
- **Added** 10 debug components for reusability
- **Implemented** enterprise design system with glassmorphism
- **Added** dark/light mode toggle
- **Improved** color scheme with vibrant status indicators
- **Added** data transformation layer for API compatibility
- **Expanded** sample data to 6 traces (including 2 failures)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
