# Smart AI Agent

A modern, AI-powered UI kit and dashboard built with React, Vite, TypeScript, and [shadcn/ui](https://ui.shadcn.com/). This project demonstrates a collaborative workspace for software engineering teams, featuring AI agents, project boards, chat, and productivity tools.

## Features

- **AI Agents**: Smart assistants for code generation, architecture, DevOps, and more.
- **Project Board**: Kanban-style board for managing tasks, projects, and teams.
- **Task Chat**: Real-time chat with AI and team members, including code suggestions and task creation.
- **Responsive UI**: Fully responsive design using Tailwind CSS.
- **Authentication**: User authentication via Clerk.
- **Reusable Components**: Built with [shadcn/ui](src/components/ui) and Radix UI primitives.
- **TypeScript**: Full type safety across the codebase.

## Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Clerk](https://clerk.com/) (authentication)
- [Lucide Icons](https://lucide.dev/)
- [@tanstack/react-query](https://tanstack.com/query/latest)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Bun](https://bun.sh/) or [npm](https://www.npmjs.com/) (for dependency management)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/aximoxai/orbital
   cd orbital
   ```

2. **Install dependencies:**
   ```sh
   bun install
   # or
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Clerk publishable key.

4. **Start the development server:**
   ```sh
   bun run dev
   # or
   npm run dev
   ```

5. **Command To Generate Client**
```
openapi-generator-cli generate -i swagger-spec.json -g typescript-axios -o src/api-client
```

6. **Open [http://localhost:5173](http://localhost:5173) in your browser.**

## Project Structure

- `src/`
  - `components/` – UI components (including `TaskChat`, `LeftPanel`, `MonacoCanvas`, and [shadcn/ui](src/components/ui))
  - `pages/` – Main pages (`Index`, `ProjectBoard`, `SoftwareEngineering`, `SignIn`, `SignUp`, `NotFound`)
  - `hooks/` – Custom React hooks
  - `lib/` – Utilities
  - `App.tsx` – Main app entry
  - `index.css` – Tailwind and design system

## Scripts

- `dev` – Start the development server
- `build` – Build for production
- `preview` – Preview the production build
- `lint` – Run ESLint

## Customization

- **UI Theme**: Modify `src/index.css` for colors, fonts, and design tokens.
- **AI Agents**: Edit `src/pages/SoftwareEngineering.tsx` to add or customize AI agents.
- **Project Board**: Update `src/pages/ProjectBoard.tsx` for task and project logic.

## License

MIT

---

Inspired by modern SaaS dashboards and collaborative engineering tools.
