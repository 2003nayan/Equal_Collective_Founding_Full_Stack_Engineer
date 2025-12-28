# 🔬 X-Ray Debugger

A production-ready debugging system for non-deterministic AI pipelines. Built with **Next.js 16**, **TypeScript**, and **React 19**.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

## 📋 Overview

X-Ray Debugger provides complete visibility into AI pipeline execution by logging each step's inputs, outputs, and reasoning. It features a modern dashboard UI to visualize traces with interactive filtering, funnel analysis, and focus mode for debugging failures.

### Key Features

- **📊 Trace Visualization** – View complete pipeline executions with expandable step details
- **🎯 Funnel Analysis** – Visual funnel showing candidate flow through pipeline stages
- **🔍 Filter Visualizer** – Table view of filter evaluations with pass/fail indicators
- **💡 Reasoning Badges** – Auto-parsed reasoning with color-coded keyword badges
- **📝 Syntax Highlighting** – JSON inputs/outputs with copy-to-clipboard functionality
- **👁️ Focus Mode** – Toggle to show only failed steps for faster debugging
- **🔌 Storage Adapters** – Pluggable storage backends (File, Memory, PostgreSQL)
- **🧬 Regression Detection** – Detect structural changes between pipeline runs

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
cd xray-debugger-next

# Install dependencies
npm install

# Generate sample trace data
npx tsx scripts/generate-data.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 📁 Project Structure

```
xray-debugger-next/
├── app/
│   ├── api/                 # API routes (if any)
│   ├── page.tsx             # Main dashboard component
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles (Tailwind)
├── src/
│   ├── lib/
│   │   ├── xray.ts          # Type-safe SDK with generics
│   │   └── storage.ts       # Storage adapter pattern
│   └── types.ts             # TypeScript type definitions
├── scripts/
│   └── generate-data.ts     # Demo data generator (4-step workflow)
├── data/
│   └── traces.json          # Persisted trace data
└── public/                  # Static assets
```

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

// Use in-memory storage for testing
const storage = new MemoryStorageAdapter();
const xray = XRaySDK.getInstance(storage);
```

### Regression Detection

```typescript
xray.enableRegressionMode();

// ... add steps ...

const result = await xray.checkRegression("previous-trace-id");
if (result.hasRegression) {
  console.log("Structural changes detected:", result.changes);
}
```

---

## 📊 Dashboard Features

### Trace Timeline

View all pipeline executions with status indicators, timestamps, and step counts.

### Expandable Steps

Click any step to view:

- **Input/Output JSON** with syntax highlighting
- **Reasoning badges** auto-extracted from reasoning text
- **Copy buttons** for JSON data

### Funnel Visualization

Visual representation of candidate flow:

- Shows count at each pipeline stage
- Color-coded for success (green) and failure (red)
- Conversion percentage between stages

### Filter Visualizer

Detailed table showing:

- Each candidate evaluation
- Pass/fail status with reasons
- Price, rating, and review data

### Focus Mode

Toggle to show only failed steps – ideal for debugging pipeline failures.

---

## 🔌 Storage Adapters

| Adapter                  | Use Case                     | Status            |
| ------------------------ | ---------------------------- | ----------------- |
| `FileStorageAdapter`     | Local development, CLI tools | ✅ Implemented    |
| `MemoryStorageAdapter`   | Unit testing                 | ✅ Implemented    |
| `PostgresStorageAdapter` | Production databases         | 📋 Interface only |

### Implementing Custom Adapters

```typescript
import { StorageInterface, Trace, TracesData } from "./src/lib/storage";

class CustomStorageAdapter implements StorageInterface {
  async readTraces(): Promise<TracesData> {
    /* ... */
  }
  async writeTrace(trace: Trace): Promise<void> {
    /* ... */
  }
  async getTrace(traceId: string): Promise<Trace | null> {
    /* ... */
  }
  async deleteTrace(traceId: string): Promise<boolean> {
    /* ... */
  }
  async isAvailable(): Promise<boolean> {
    /* ... */
  }
}
```

---

## 🧪 Demo Workflow

The included demo script (`scripts/generate-data.ts`) simulates a 4-step **Amazon Competitor Selection** workflow:

1. **Keyword Generation** – Generate search keywords from product name
2. **Candidate Search** – Find competitor products using keywords
3. **Apply Filters** – Filter candidates by price and rating thresholds
4. **Rank & Select** – Rank qualified candidates and select the best

Generate sample traces:

```bash
npx tsx scripts/generate-data.ts
```

This creates traces with varying scenarios:

- ✅ Perfect runs (all steps succeed)
- ❌ Failure scenarios (filter step fails)
- ⚡ Partial success (some candidates filtered out)

---

## 📦 Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19.2.3, Tailwind CSS 4
- **Syntax Highlighting**: react-syntax-highlighter
- **Icons**: lucide-react

---

## 📝 Available Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
