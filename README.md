[![Orbital Build Status](https://github.com/AximoxAI/orbital/actions/workflows/webpack.yml/badge.svg)](https://github.com/AximoxAI/orbital/actions/workflows/webpack.yml)

# Orbital - Multi-Agent SDLC Platform

Orbital offers a comprehensive workspace for software engineering teams, featuring intelligent AI agents, project management tools, real-time task collaboration, and productivity enhancements.

![Orbital Platform Screenshot](https://raw.githubusercontent.com/AximoxAI/orbital/refs/heads/main/public/preview-version.png)



## 🚀 Key Features

### AI-Powered Collaboration
- **Multi-Agent Support**: Integrate with @goose, @orbital_cli, @gemini_cli, @claude_code AI agents
- **Compare and Contrast**: Generate code or fix issues and apply the best 
- **Automatic Github Sync**: Sync Code or Issues from Github
- **Real-time Task Chat**: Live collaboration with AI assistants and team members
- **Code Generation**: AI-assisted code writing, refactoring, and debugging
- **Secure Sandbox**: Use secure sandboxes for running agentic tools and code.
- **Requirements Generation**: Automatically generate project requirements from descriptions

### Project Management
- **Kanban Board**: Visual project management with drag-and-drop functionality
- **Task Management**: Create, assign, and track tasks with detailed metadata
- **Project Organization**: Multi-project workspace with team collaboration
- **Progress Tracking**: Monitor task completion and project milestones

### Development Tools
- **Integrated Code Editor**: Monaco Editor with syntax highlighting and IntelliSense
- **API Client Generation**: Auto-generated TypeScript client from OpenAPI specs
- **Real-time Logs**: Live execution logs and debugging information
- **Socket.IO Integration**: Real-time updates and collaboration features

### Enterprise-Ready
- **Authentication**: Secure user management via Clerk
- **Responsive Design**: Mobile-first, fully responsive UI
- **Type Safety**: Full TypeScript coverage across the application
- **Component Library**: Reusable shadcn/ui components with consistent design

## 🏗️ Architecture

### Frontend (React + Vite)
```
src/
├── components/
│   ├── taskChatComponents/     # Task collaboration features
│   │   ├── TaskChat.tsx        # Main chat interface
│   │   ├── LeftPanel.tsx       # Navigation sidebar
│   │   ├── LogsPanel.tsx       # Execution logs
│   │   └── MonacoCanvas.tsx    # Code editor
│   ├── apiComponents/          # API integration
│   │   ├── CreateProject.tsx   # Project creation
│   │   ├── CreateTask.tsx      # Task management
│   │   └── GenerateRequirements.tsx
│   └── ui/                     # Reusable UI components
├── pages/                      # Application routes
│   ├── Index.tsx              # Landing page
│   ├── ProjectBoard.tsx       # Main dashboard
│   ├── SoftwareEngineering.tsx # AI agents showcase
│   └── TaskChat routes        # Individual task views
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities and helpers
└── api-client/               # Generated API client
```

### Backend (NestJS)
Located in `orbital-be/` - RESTful API with WebSocket support, PostgreSQL database, and AI service integrations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS variables
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Authentication**: [Clerk](https://clerk.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL with TypeORM
- **Real-time**: Socket.IO
- **AI Integration**: OpenAI, Anthropic Claude, Google Gemini
- **API Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- **Node.js** (v18+ recommended)
- **Package Manager**: [Bun](https://bun.sh/) (recommended) or npm/yarn
- **Database**: PostgreSQL (for backend)
- **API Keys**: Clerk, OpenAI, and other AI providers

## 🚀 Getting Started

### Frontend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aximoxai/orbital
   cd orbital
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install

3. **Start development server:**
   ```bash
   bun run dev
   ```

## 📁 Detailed Project Structure

### Core Application Flow

```mermaid
graph TD
    A[Landing Page] --> B{User Authenticated?}
    B -->|No| C[Sign In/Up]
    B -->|Yes| D[Project Board]
    D --> E[Create/View Projects]
    D --> F[Create Tasks]
    F --> G[Task Chat Interface]
    G --> H[AI Agent Interaction]
    G --> I[Code Editor]
    G --> J[Real-time Collaboration]
```

### Key Components

#### TaskChat System
- **Real-time messaging** with AI agents and team members
- **Code execution environment** with live logs
- **Multi-agent support** for different AI providers
- **File sharing and code snippets**

#### Project Management
- **Visual Kanban board** with drag-and-drop
- **Task lifecycle management** (TODO → In Progress → Done)
- **Team collaboration** and assignment
- **Progress analytics and reporting**

#### AI Integration
- **Context-aware conversations** with project and task context
- **Code generation and review** capabilities
- **Automated testing and documentation**
- **Requirements analysis and planning**


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Aximox team**
