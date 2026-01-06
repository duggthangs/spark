# Interactive Agent Experience Engine (IAEE) ✨

Replace static markdown plans with deterministic, delightful, Brilliant-style interactive experiences.

IAEE allows agents to emit structured JSON plans that a human can actively reason through, decide on, and guide via a structured wizard interaction.

---

## 🚀 Vision

Agentic workflows today often produce long, linear markdown plans that are passive and boring to review. IAEE introduces an interactive, schema-driven layer where:
- **Agents emit data (JSON)**, not just text.
- **Humans interact step-by-step** through a guided wizard.
- **Decisions and reasoning are captured explicitly**.
- **Agents receive high-signal Markdown summaries** at the end.

---

## 🛠️ Key Features

- **CLI Runtime**: Run `iaee run plan.json` to start a local interaction server.
- **Brilliant-style UI**: A focused, step-by-step wizard layout with snappy transitions.
- **12+ Interactive Sections**: Kanban boards, Data mappers, API builders, Live Code editors, and more.
- **Markdown Compiler**: Automatically transforms interaction results back into clean Markdown for agent consumption.
- **Playground Mode**: A developer "gallery" to test all interactive components in isolation.

---

## 📦 Quick Start

### 1. Install
```bash
bun install
```

### 2. Build the UI
```bash
bun run build
```

### 3. Run a Demo
```bash
bun cli/index.ts run examples/demo.json --port 3002
```

---

## 📖 Documentation

- **[Agent Guide](./docs/AGENT_GUIDE.md)**: Learn how to generate valid Experience JSON.
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)**: Architecture overview and debugging tips.
- **[Interactive Experiences](./docs/interactive-experiences-reference.md)**: Catalog of all supported UI components.

---

## 📁 Project Structure

- **`/cli`**: Local server and command-line interface logic.
- **`/engine`**: The "brain" — Zod schemas, validation, and Markdown compilation.
- **`/ui`**: The "face" — React-based wizard application.
- **`/docs`**: Specialized guides for agents and maintainers.
- **`/examples`**: Sample JSON files for testing different flows.

---

## 🤝 Contributing

IAEE is built with **Bun**, **React**, and **Tailwind CSS**. 
For bug fixes or feature requests, please refer to the **[Developer Guide](./docs/DEVELOPER_GUIDE.md)**.
