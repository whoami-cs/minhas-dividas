# Project Structure

## Architecture Overview
This is a full-stack application with a clear separation between frontend (Angular) and backend (Node.js/Express API). The frontend handles UI/UX and client-side logic, while the backend provides API endpoints for AI chat functionality and file processing.

## Directory Structure

### Root Level
```
minhasdividas-main/
├── src/                    # Angular frontend application
├── api/                    # Node.js Express backend API
├── migrations/             # Database migration scripts
├── .amazonq/              # Amazon Q configuration and rules
├── angular.json           # Angular CLI configuration
├── package.json           # Frontend dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

### Frontend Structure (`src/`)
```
src/
├── components/            # Angular components
│   ├── ai-chat/          # AI assistant chat interface
│   ├── auth/             # Authentication components
│   ├── credit-card-debts/    # Credit card debt list
│   ├── credit-card-detail/   # Individual debt details
│   ├── loans/            # Loan list view
│   ├── loan-detail/      # Individual loan details
│   ├── dashboard/        # Main dashboard
│   ├── income/           # Income tracking
│   ├── savings-goals/    # Savings goal management
│   ├── negotiation-offers/   # Debt negotiation tracking
│   ├── settings/         # User settings
│   └── [utility components]  # Modals, toasts, breadcrumbs, etc.
├── services/             # Angular services
│   ├── data.service.ts   # Main data access layer (Supabase)
│   ├── auth.service.ts   # Authentication service
│   ├── gemini.service.ts # AI chat service
│   ├── settings.service.ts   # User settings management
│   └── token.service.ts  # Token management
├── models/               # TypeScript interfaces/types
│   └── debt.model.ts     # Data models for debts and loans
├── pipes/                # Angular pipes
│   └── parse-date.pipe.ts    # Date parsing utility
├── environments/         # Environment configurations
│   └── environment.ts    # Supabase credentials
├── app.component.ts      # Root component
├── app.routes.ts         # Application routing
└── styles.css            # Global styles
```

### Backend Structure (`api/`)
```
api/
├── src/
│   ├── controllers/      # Request handlers
│   │   └── aiChatController.js   # AI chat endpoint logic
│   ├── routes/           # API route definitions
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration files
│   │   └── database.js   # Database connection setup
│   └── server.js         # Express server entry point
├── package.json          # Backend dependencies
└── README.md             # API documentation
```

### Database Migrations (`migrations/`)
```
migrations/
├── 001_initial_schema.sql        # Core tables (debts, loans)
├── 002_create_negotiation_offers.sql
├── 003_create_loan_attachments.sql
├── 004_create_income.sql
├── 005_create_savings_goals.sql
├── 006_create_ai_conversations.sql
├── 007_create_user_settings.sql
├── 008_secure_storage_buckets.sql
├── 009_create_debt_attachments.sql
└── 999_seed_data.sql             # Sample data
```

## Core Components and Relationships

### Data Flow Architecture
1. **Frontend Components** → **Data Service** → **Supabase Client** → **Database**
2. **AI Chat Component** → **Gemini Service** → **Backend API** → **Google Gemini AI**
3. **File Uploads** → **Data Service** → **Supabase Storage** → **Cloud Buckets**

### Key Component Relationships

#### Credit Card Debt Management
- `credit-card-debts.component` (list view) → `credit-card-detail.component` (detail view)
- Both use `data.service` for CRUD operations
- Detail component includes forms for editing and attachment management

#### Loan Management
- `loans.component` (list view) → `loan-detail.component` (detail view)
- `installment-form.component` - manages individual installment records
- `balance-evolution-form.component` - tracks balance changes over time

#### Dashboard
- `dashboard.component` aggregates data from multiple services
- Displays charts using Chart.js
- Shows summaries of debts, loans, income, and savings

#### AI Assistant
- `ai-chat.component` provides conversational interface
- `gemini.service` handles frontend AI logic
- Backend `aiChatController` processes requests with context

### Service Layer Architecture

#### DataService (Primary Data Access)
- Centralized Supabase client management
- CRUD operations for all entities:
  - Credit card debts
  - Loans and installments
  - Income records
  - Savings goals
  - Negotiation offers
  - Attachments
- File upload/download functionality
- Real-time data subscriptions

#### AuthService
- User authentication via Supabase Auth
- Session management
- Protected route guards

#### GeminiService
- AI chat interface
- Context building from user financial data
- Message history management
- Integration with backend API

## Architectural Patterns

### Frontend Patterns
- **Component-Based Architecture**: Modular Angular components with clear responsibilities
- **Service Layer Pattern**: Business logic separated into injectable services
- **Reactive Programming**: RxJS observables for async operations
- **Route-Based Navigation**: Angular Router for SPA navigation
- **Form Management**: Reactive forms for data input and validation

### Backend Patterns
- **RESTful API**: Express routes following REST conventions
- **Controller Pattern**: Request handling separated from business logic
- **Middleware Chain**: CORS, authentication, error handling
- **Environment Configuration**: dotenv for secrets management

### Database Patterns
- **Row Level Security (RLS)**: Supabase policies for data access control
- **Migration-Based Schema**: Versioned SQL migrations
- **JSONB Storage**: Complex data structures (installments, balance evolution)
- **Relational Design**: Foreign keys linking related entities

### Integration Patterns
- **BaaS (Backend as a Service)**: Supabase for database, auth, and storage
- **API Gateway Pattern**: Backend API as intermediary for AI services
- **Cloud Storage**: Supabase buckets for file management
- **Third-Party AI**: Google Gemini for conversational AI
