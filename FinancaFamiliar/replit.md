# Overview

FinanFamily is a personal financial management application designed for family use. The application provides a comprehensive dashboard for tracking bills, income, expenses, and financial goals. It features AI-powered financial advice, automated bill reminders via email, and detailed analytics to help families manage their finances effectively.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript**: Modern React application with TypeScript for type safety
- **Vite**: Fast build tool and development server with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework for styling with custom design system
- **Shadcn/ui Components**: Pre-built, accessible UI components based on Radix UI primitives
- **Wouter**: Lightweight client-side routing library
- **React Query**: Server state management and data fetching with caching
- **React Hook Form**: Form handling with Zod validation schemas

## Backend Architecture
- **Express.js**: Node.js web framework handling API routes and middleware
- **TypeScript**: Full-stack type safety with shared schemas
- **RESTful API**: Standard HTTP methods for CRUD operations
- **Session-based Storage**: In-memory storage implementation with interface for future database migration
- **Middleware Stack**: Request logging, JSON parsing, and error handling

## Data Storage Solutions
- **PostgreSQL with Drizzle ORM**: Configured for production database with migration support
- **Neon Database**: Serverless PostgreSQL provider for cloud deployment
- **In-Memory Storage**: Development fallback with full interface compatibility
- **Shared Schema**: TypeScript schemas shared between client and server using Zod validation

## Authentication and Authorization
- **Session-based Authentication**: User sessions with cookie management
- **User Context**: Centralized user state management
- **Route Protection**: Authentication checks on protected API endpoints

## Design System
- **CSS Variables**: Dynamic theming with light/dark mode support
- **Component Variants**: Consistent UI patterns using class-variance-authority
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Icon System**: FontAwesome integration for consistent iconography

## Data Flow Architecture
- **Component-based State**: Local state management in React components
- **Server State Caching**: React Query handles API data caching and synchronization
- **Form State**: React Hook Form manages form state with validation
- **Real-time Updates**: Periodic data refreshing for dashboard metrics

# External Dependencies

## AI Services
- **Google Gemini AI**: Financial advice generation and bill pattern analysis using the newest Gemini 2.5 models
- **AI Assistant Service**: Custom wrapper for generating personalized financial recommendations

## Email Services
- **SendGrid**: Transactional email service for bill reminders and notifications
- **Email Templates**: HTML email templates for bill reminders and overdue notifications

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## Development Tools
- **Replit Integration**: Development environment with runtime error handling
- **Cartographer Plugin**: Development navigation assistance
- **Dev Banner**: Development environment indicators

## UI Component Libraries
- **Radix UI**: Headless UI primitives for accessibility and keyboard navigation
- **Recharts**: Chart and visualization library for financial analytics
- **Date-fns**: Date manipulation and formatting utilities
- **Lucide React**: Icon library for modern interface elements

## Utility Libraries
- **Class Variance Authority**: Type-safe component variant management
- **CLSX + Tailwind Merge**: Conditional CSS class composition
- **React Day Picker**: Calendar component for date selection
- **Embla Carousel**: Touch-friendly carousel implementation