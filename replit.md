# Tu Casa en Subasta - Property Auction Platform

## Overview

Tu Casa en Subasta is a comprehensive web application for property auctions targeting Spanish-speaking users. The platform allows users to discover properties at auction with discounts up to 70%, featuring advanced filtering, investment analysis, and user management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **Forms**: React Hook Form with Zod for validation
- **Authentication**: Context-based auth provider with protected routes

### Backend Architecture
- **Runtime**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Session-based authentication using Passport.js
- **Password Security**: bcrypt for password hashing with custom scrypt implementation
- **Session Store**: PostgreSQL session store using connect-pg-simple

### Key Components

#### Authentication System
- Two-step user registration process
- Session-based authentication with secure password hashing
- Protected routes requiring authentication
- Global authentication context for state management

#### Property Management
- Comprehensive property listings with detailed information
- Advanced filtering by state, city, price range, property type, auction type
- Investment analysis calculations (ROI, cap rate, market value)
- Image galleries and property details
- Favorites/saved properties functionality

#### User Interface
- Responsive design optimized for desktop and mobile
- Professional landing page with conversion focus
- Dashboard with statistics and metrics
- Property cards with key information display
- Detailed property pages with investment analysis

#### Database Schema
- **Users**: Full user profiles with subscription management
- **Properties**: Complete property details including auction information, pricing, location, and investment metrics
- **Saved Properties**: User favorites with timestamps and relationships

### Data Flow

1. **Authentication Flow**: Users register/login → Session created → Protected routes accessible
2. **Property Discovery**: Users browse → Apply filters → View results → Save favorites
3. **Property Details**: Select property → View detailed analysis → Investment calculations
4. **User Management**: Profile updates → Subscription tracking → Preferences

### External Dependencies

#### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **passport**: Authentication middleware with local strategy
- **bcryptjs**: Password hashing and verification
- **express-session**: Session management middleware

#### UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **react-hook-form**: Performant form handling
- **zod**: Schema validation

### Deployment Strategy

#### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- TypeScript compilation with strict mode enabled
- ESNext modules with bundler resolution
- Replit-specific development tools and error handling

#### Production Build
- Frontend: Vite build with static asset optimization
- Backend: esbuild bundling for Node.js with ESM format
- Database: Drizzle migrations with PostgreSQL dialect
- Session management: PostgreSQL-backed session store for scalability

#### Environment Configuration
- DATABASE_URL: Required PostgreSQL connection string
- SESSION_SECRET: Required for session security
- Node.js with ES modules support
- TypeScript with path mapping for clean imports

The architecture emphasizes type safety, performance, and scalability while maintaining a clear separation between frontend and backend concerns. The use of modern tools like Drizzle ORM, TanStack Query, and Vite ensures efficient development and optimal runtime performance.