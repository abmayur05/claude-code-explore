# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UIGen** is an AI-powered React component generator with live preview. Users describe components in a chat interface, and Claude generates React code in real-time. Components are previewed without writing to disk, and authenticated users can persist their projects to a database.

## Development Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development with Turbopack hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint with ESLint
npm lint

# Run tests with Vitest
npm test

# Reset database (clears all user data and projects)
npm run db:reset
```

For running a single test file:
```bash
npm test -- src/components/chat/__tests__/ChatInterface.test.tsx
```

The dev server runs on http://localhost:3000. The application requires Node.js 18+.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Prisma ORM with SQLite (`prisma/dev.db`)
- **AI**: Anthropic Claude via Vercel AI SDK (v4.3.16)
- **Testing**: Vitest with @testing-library
- **UI Components**: Radix UI primitives

### Key Design Patterns

#### 1. Virtual File System (In-Memory)
The application uses an in-memory `VirtualFileSystem` class (`src/lib/file-system.ts`) that manages a tree structure of files without writing to disk. This allows:
- Generated React components to be edited and previewed immediately
- No file I/O overhead during chat interactions
- Safe sandboxing of generated code

The file system is serialized/deserialized as JSON when saving/loading projects.

#### 2. Chat-Driven Component Generation
The `/api/chat` route handles Claude interactions via the Vercel AI SDK with tool calling:
- **`str_replace_editor` tool**: For editing existing files in the virtual file system
- **`file_manager` tool**: For creating, deleting, and managing files
- **Streaming responses**: Results stream back using Data Stream Response format
- **Prompt caching**: System prompt uses Anthropic's ephemeral cache for cost reduction

The generation prompt (`src/lib/prompts/generation.tsx`) instructs Claude on component generation strategies.

#### 3. Project Persistence
- **Authenticated users**: Projects saved to database with chat history and file system state
- **Anonymous users**: Work without persistence (session-only)
- **Database schema**: User model with email/password, Project model storing JSON-serialized messages and file data
- **Project structure**: Each project has a unique ID, name, message history, and serialized virtual file system

#### 4. State Management
- **FileSystemProvider** (`src/lib/contexts/file-system-context.tsx`): Manages the virtual file system and file operations
- **ChatProvider** (`src/lib/contexts/chat-context.tsx`): Manages chat messages and API communication with the `/api/chat` endpoint
- **useAuth hook**: Handles user authentication state and session management

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [projectId]/        # Project page with dynamic routing
│   ├── api/chat/           # AI chat streaming endpoint
│   ├── page.tsx            # Home page (auth redirect or landing)
│   └── layout.tsx
├── components/
│   ├── ui/                 # Radix UI-based button, dialog, tabs, etc.
│   ├── chat/               # Chat interface (messages, input, markdown rendering)
│   ├── editor/             # Code editor and file tree components
│   ├── preview/            # PreviewFrame for component preview
│   ├── auth/               # SignInForm, SignUpForm, AuthDialog
│   └── HeaderActions.tsx
├── lib/
│   ├── file-system.ts      # VirtualFileSystem class
│   ├── contexts/           # React contexts (FileSystem, Chat)
│   ├── tools/              # Tool builders (str_replace, file_manager)
│   ├── transform/          # JSX transformation utilities
│   ├── prompts/            # Claude system prompts
│   ├── auth.ts             # Session and authentication logic
│   ├── provider.ts         # AI model provider setup
│   └── prisma.ts           # Prisma client singleton
├── actions/                # Next.js server actions (auth, projects)
├── hooks/                  # Custom React hooks
├── middleware.ts           # Next.js middleware
└── generated/prisma/       # Auto-generated Prisma client
```

### Database Schema
Two models:
- **User**: id, email, password (bcrypt hashed), timestamps, and relation to projects
- **Project**: id, name, userId (optional for anonymous), messages (JSON string), data (serialized VirtualFileSystem), timestamps

## Key Implementation Details

### Mock Provider Fallback
If `ANTHROPIC_API_KEY` is not set, the app falls back to a mock provider that returns static component code. This allows the app to run without an API key for development/demo purposes.

### Component Preview
The `PreviewFrame` component (`src/components/preview/PreviewFrame.tsx`) evaluates generated JSX in an iframe using Babel Standalone for runtime transpilation. Generated components are isolated and sandboxed.

### Authentication
- Session-based using JWT (`jose` library)
- Passwords hashed with bcrypt
- Middleware checks session on protected routes
- User info includes id and email

### Testing Structure
Test files are colocated in `__tests__` directories alongside components (e.g., `src/components/chat/__tests__/ChatInterface.test.tsx`). Tests use Vitest and @testing-library/react.

## Development Workflow

1. **Adding a new chat tool**: Create a builder function in `src/lib/tools/`, export it, and register it in the `tools` object in `/api/chat/route.ts`
2. **Modifying the generation prompt**: Edit `src/lib/prompts/generation.tsx`—this is where you control Claude's behavior
3. **Changing UI components**: Edit component files in `src/components/ui/` (Radix UI wrapper components)
4. **Adding pages**: Create new route groups or files in `src/app/`
5. **Database changes**: Modify `prisma/schema.prisma`, then run `npx prisma migrate dev`

## Common Debugging

- **Prisma client issues**: Run `npx prisma generate` to regenerate the client
- **Database locked**: Delete `prisma/dev.db` and run `npm run setup` to reset
- **Virtual file system inconsistency**: Check FileSystemContext initialization and serialization in chat flow
- **Component preview errors**: Check browser console in PreviewFrame iframe; JSX must be valid
