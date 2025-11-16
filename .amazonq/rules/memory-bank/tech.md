# Technology Stack

## Programming Languages
- **TypeScript** (~5.8.2): Primary language for frontend development
- **JavaScript** (ES6+): Backend API and utility scripts
- **SQL**: Database schema and migrations

## Frontend Stack

### Core Framework
- **Angular** (20.3.x): Modern web application framework
  - @angular/core: 20.3.0
  - @angular/common: 20.3.0
  - @angular/forms: 20.3.10
  - @angular/router: 20.3.10
  - @angular/compiler: 20.3.0

### Build Tools
- **Angular CLI** (20.3.9): Project scaffolding and build management
- **Vite** (6.2.0): Fast build tool and dev server
- **TypeScript Compiler**: Type checking and transpilation

### UI & Styling
- **TailwindCSS** (latest): Utility-first CSS framework
- **Chart.js** (4.5.1): Data visualization and charts

### State Management & Data Flow
- **RxJS** (7.8.2): Reactive programming with observables

### Third-Party Integrations
- **@supabase/supabase-js** (2.81.1): Supabase client for database and auth
- **@google/generative-ai** (0.24.1): Google Gemini AI integration
- **marked** (17.0.0): Markdown parsing for AI responses
- **pdf-lib** (1.17.1): PDF generation and manipulation

## Backend Stack

### Runtime & Framework
- **Node.js**: JavaScript runtime
- **Express** (4.18.2): Web application framework

### Database & Storage
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database
  - Authentication
  - Storage buckets
  - Row Level Security
- **@supabase/supabase-js** (2.39.0): Supabase client library
- **pg** (8.11.3): PostgreSQL client for Node.js
- **postgres** (3.4.7): Alternative PostgreSQL client

### AI & Machine Learning
- **@google/generative-ai** (0.21.0): Google Gemini AI SDK

### Utilities
- **cors** (2.8.5): Cross-Origin Resource Sharing middleware
- **dotenv** (16.3.1): Environment variable management
- **multer** (1.4.5-lts.1): File upload handling
- **pdf-parse** (2.4.5): PDF text extraction
- **axios** (1.13.2): HTTP client
- **zod** (3.25.76): Schema validation
- **zod-to-json-schema** (3.24.6): Convert Zod schemas to JSON Schema

### Database Migrations
- **node-pg-migrate** (6.2.2): PostgreSQL migration tool

## Development Tools

### Package Management
- **npm**: Node package manager (lockfiles present)

### Development Server
- **nodemon** (3.0.2): Auto-restart for backend development
- **Angular Dev Server**: Hot reload for frontend (port 3000)

### Type Definitions
- **@types/node** (22.14.0): Node.js type definitions

## Development Commands

### Frontend Development
```bash
npm run dev          # Start Angular dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend Development
```bash
cd api
npm run dev          # Start API server with nodemon
npm start            # Start API server (production)
```

### Full Stack Development
Run both frontend and backend simultaneously:
1. Terminal 1: `npm run dev` (frontend)
2. Terminal 2: `cd api && npm run dev` (backend)

## Environment Configuration

### Frontend Environment (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

### Backend Environment (`api/.env`)
Required variables:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `GEMINI_API_KEY`: Google Gemini API key
- Database connection strings (if using direct PostgreSQL)

## Database Technology

### Supabase PostgreSQL
- **Version**: Latest Supabase-managed PostgreSQL
- **Features Used**:
  - JSONB columns for complex data structures
  - Row Level Security (RLS) policies
  - Triggers and functions
  - Full-text search capabilities
  - Real-time subscriptions

### Schema Management
- Migration-based approach using SQL files
- Versioned migrations (001, 002, etc.)
- Seed data for initial setup (999_seed_data.sql)

## Deployment

### Frontend Deployment
- **Platform**: Netlify (configured via netlify.toml)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Routing**: Configured for client-side routing

### Backend Deployment
- Can be deployed to any Node.js hosting platform
- Requires environment variables configuration
- Recommended: Render, Railway, or similar Node.js hosts

## Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## API Integrations

### Google Gemini AI
- Model: gemini-pro or gemini-1.5-flash
- Purpose: Conversational AI for financial advice
- Integration: Via @google/generative-ai SDK

### Supabase Services
- **Database**: PostgreSQL with REST API
- **Authentication**: Email/password, OAuth providers
- **Storage**: File uploads and downloads
- **Real-time**: WebSocket subscriptions for live data

## Security Considerations
- Environment variables for sensitive credentials
- Row Level Security on database tables
- CORS configuration for API access
- Secure file upload validation
- Token-based authentication
