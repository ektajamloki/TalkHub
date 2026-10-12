# TalkHub 💬🤖

TalkHub is a fast, full-stack AI chat application powered by the Google Gemini API. Built with React, TypeScript, Tailwind CSS, and an Express proxy backend, TalkHub delivers real-time token streaming with automatic failover and multi-model support.

---

## ✨ Features

- **⚡ Real-Time Streaming**: Live chunked text generation streaming straight from Gemini.
- **🔄 Multi-Model Switching**: Seamlessly switch between different Gemini models:
  - **Gemini Flash 3.8**: Fast, versatile, and recommended for everyday tasks.
  - **Gemini Flash Lite 3.1**: Ultra-low latency and lightweight responses.
  - **Gemini Pro 3.1**: Advanced reasoning, coding, and complex problem solving.
- **🛡️ Secure Backend Proxy**: The Gemini API key is kept securely on the Express server—never exposed to the client browser.
- **🔁 Built-in Resilience & Fallback**: Automatic retry logic and graceful model fallback to handle temporary high-demand spikes without dropping user queries.
- **🎨 Modern, Responsive UI**: Built with Tailwind CSS, Lucide icons, responsive sidebar drawer for mobile devices, and quick-prompt starters.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Express.js, `@google/genai` TypeScript SDK, `tsx`
- **Build**: Vite + esbuild (Node CJS server bundle)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/talkhub.git
   cd talkhub
