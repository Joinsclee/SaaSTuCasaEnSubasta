# Tu Casa en Subasta - Property Auction Platform

## Overview

Tu Casa en Subasta is a comprehensive web application for property auctions targeting Spanish-speaking users. The platform allows users to discover properties at auction with discounts up to 90%, featuring advanced filtering, investment analysis, and user management capabilities. The platform now features a professional landing page as the main entry point, showcasing Kevin as the expert property evaluator.

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Spanish - Always communicate in Spanish with the user.

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

## Recent Changes

### Imágenes de Estados Completas y UX Mejorada (July 28, 2025)
- **Extracción Completa**: Procesados dos archivos ZIP con todas las 50 imágenes de estados
- **Organización de Archivos**: Creada estructura `/attached_assets/states/` con códigos estandarizados (AL.png, AK.png, etc.)
- **Servidor Estático**: Configurado Express para servir archivos desde `/attached_assets`
- **Diseño Mejorado**: Aumentado tamaño de botones de estados (h-32 vs h-20) e imágenes (16x16 vs 12x12)
- **Grid Responsivo**: Reducido número de columnas para mejor visualización (2-6 columnas vs 6-14)
- **Nombres Completos**: Reemplazados códigos de estado (NY) con nombres completos (New York)
- **Efectos Visuales**: Agregado hover:scale-105 y transiciones suaves en botones
- **Fallback Robusto**: Sistema de respaldo a emojis si las imágenes fallan al cargar

### Sistema de Filtros con Tablero de Estados y Calendario (July 24, 2025)
- **Tablero Visual de Estados**: Grid interactivo con todos los estados estadounidenses
- **Iconos de Estados**: Emojis representativos como placeholders (preparado para imágenes reales)
- **Calendario Integrado**: Muestra eventos de subastas por mes con navegación
- **Filtrado Dinámico**: Calendario se actualiza según estado seleccionado
- **API de Eventos**: Endpoint `/api/auction-events` con datos de muestra generados
- **Información Detallada**: Muestra tipo de subasta, hora y cantidad de propiedades
- **Navegación Mensual**: Botones para navegar entre meses del año
- **Vista Dual**: Todos los eventos o filtrados por estado específico

### Iconos de Estados en Filtros (July 22, 2025)
- **UX Mejorada**: Agregados emojis representativos para cada estado estadounidense
- **Visual Intuitiva**: Iconos como 🌵 para Arizona, 🗽 para New York, 🌞 para California
- **Selector Mejorado**: Muestra ícono y nombre del estado tanto en opciones como en valor seleccionado
- **Bandera Nacional**: Opción "Todos los estados" con bandera 🇺🇸 para consistencia visual
- **Identificación Rápida**: Facilita a usuarios hispanohablantes reconocer estados por características culturales

### Dashboard con Propiedades Evaluadas (July 22, 2025)
- **Estadísticas Mejoradas**: Agregada nueva métrica "Propiedades Evaluadas" al dashboard
- **Backend**: Actualizada ruta `/api/dashboard/stats` para incluir conteo de evaluaciones del usuario
- **Frontend**: Ampliado grid de estadísticas de 4 a 5 columnas para mostrar nueva métrica
- **Icono**: Usado ícono de búsqueda (Search) con colores naranjas para mantener branding
- **Descripción**: Texto "con sistema de Kevin" para enfatizar la metodología de evaluación

### Sistema de Roles (July 22, 2025)
- **Base de Datos**: Agregado campo `role` a tabla users con valores "user" y "admin"
- **Middleware de Seguridad**: Implementado `requireAdmin` y `requireAuth` para protección de rutas
- **Panel de Administración**: Creada página `/admin` con estadísticas y gestión de usuarios
- **Rutas Admin**: API endpoints para estadísticas, gestión de usuarios y cambio de roles
- **Usuario Admin**: Creado usuario de prueba (admin/password) con permisos completos
- **Navegación**: Enlaces de administración en header solo visible para admins

### Sistema de Evaluación de Propiedades (July 22, 2025)
- **Nueva Página**: Creada ruta `/evaluacion` con sistema completo de evaluación
- **Proceso de 3 Pasos**: Investigación superficial, profunda y cálculo de oferta máxima
- **Validación Progresiva**: Sistema de puntuación con criterios específicos de Kevin
- **Historial de Evaluaciones**: Guardado local de propiedades evaluadas anteriormente
- **Consejos del Experto**: Tips integrados basados en la experiencia de Kevin
- **Interfaz Responsiva**: Adaptada completamente a móviles y tablets
- **Navegación**: Enlace "Evaluación" agregado al menú principal

### Landing Page as Main Entry Point (July 10, 2025)
- **Route Configuration**: Changed `/` to display LandingPage instead of Dashboard
- **User Experience**: Landing page now serves as the primary entry point for all users
- **Authentication Flow**: Users see landing page first, then can navigate to auth or dashboard
- **Dynamic Header**: Shows "Ir al Dashboard" for authenticated users, "Iniciar Sesión" for guests

### Orange Branding Implementation
- **Color Scheme**: Updated primary color from blue to orange (HSL: 22, 100%, 65%)
- **Brand Image**: Integrated professional Kevin image as hero background and team section
- **Visual Consistency**: All UI elements (buttons, icons, badges) now use orange branding

### Kevin Expert Profile
- **New Page**: Created `/kevin` route with dedicated expert profile page
- **Content Strategy**: Positioned Kevin as the property evaluation expert behind star ratings
- **Professional Credibility**: Showcases 15+ years experience and 2,500+ evaluated properties
- **Navigation**: "Conoce a Kevin" button links from landing page to expert profile

### Property Features Enhancement
- **Star Rating System**: Kevin's expert evaluations displayed as 1-5 star ratings
- **Favorites System**: Heart icon toggle for saving/removing properties from favorites
- **Auction Type Badges**: Color-coded badges (foreclosure=blue, bankruptcy=purple, tax=green)
- **Visual Hierarchy**: Improved card layout with proper spacing for all elements

### Technical Improvements
- **Form Validation**: Enhanced Spanish error messages for registration
- **Required Fields**: Made phone number mandatory with proper validation
- **Database Constraints**: Proper handling of unique username/email validation
- **Error Handling**: Comprehensive error states with user-friendly Spanish messages