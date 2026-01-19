# IMAGIC - AI IMAGE GENERATION

Link: https://imagic-eight.vercel.app

<img src="./public/imagic.png" alt="Imagic AI Image Generation" width="768" height="auto">

## Project Purpose

AI powered image generation platform that enables users to create stunning images through natural language prompts. Imagic leverages OpenAI's DALL-E 2 to transform text descriptions into high-quality visual content, providing an intuitive interface for users to bring their creative ideas to life using conversational AI.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS 4, DaisyUI
- **Backend:** Next.js API Routes, Server Actions
- **Authentication:** Clerk
- **Database:** Prisma ORM with PostgreSQL
- **Billing:** Stripe Checkout & Webhooks
- **AI Integration:** OpenAI DALL-E 2 Image Generation
- **Image Storage:** ImageKit
- **State Management:** TanStack Query
- **Form Handling:** React Hook Form with Zod validation

## Key Features

### User Management & Authentication

- Secure user authentication with Clerk
- Guest mode with limited generations for trial users
- Persistent user sessions and data
- User profile management

### Credit-Based System

- Flexible credit packages for image generations
- Subscription options for unlimited access
- Purchase history tracking
- Automatic credit allocation after successful payments

### Image History & Management

- Complete generation history for authenticated users
- Detailed image metadata (prompts, settings, creation date)
- Image download and sharing capabilities
- Organized gallery view with pagination

### Customization Options

- Color scheme selection (minimalist, vibrant, monochrome, etc.)
- Negative prompt support for avoiding unwanted elements
- Guidance scale adjustment for creative control
- High-quality 512x512 image generation

## Technical Features

### AI Integration

- **DALL-E 2 Integration:** Leverages OpenAI's efficient image generation model
- **Advanced Prompting:** Structured prompt engineering for optimal results
- **Cost-Effective:** Uses DALL-E 2 for affordable, high-quality generation
- **Error Handling:** Robust error handling for generation failures

### Backend Architecture

- **Server Actions:** Secure server-side mutations for database operations
- **Prisma ORM:** Type-safe database operations with optimized queries
- **API Routes:** RESTful endpoints for external integrations
- **Webhook Processing:** Real-time Stripe event handling

### Frontend Experience

- **Responsive Design:** Mobile-first design with Tailwind CSS
- **Real-time Updates:** Live image generation status updates
- **Component Library:** Reusable UI components with consistent styling
- **Form Validation:** Client and server-side validation with Zod schemas

### Payment & Billing

- **Stripe Integration:** Secure payment processing with Stripe Checkout
- **Multiple Pricing Tiers:** Flexible pricing options for different user needs
- **Webhook Handling:** Automated credit allocation and subscription management
- **Error Recovery:** Robust error handling for payment failures

## Development Process

### Initial Setup

- Next.js 15 with Turbopack for fast development
- Prisma schema design for users, images, subscriptions, and purchases
- Clerk authentication integration
- Tailwind CSS with DaisyUI for styling

### AI Integration

- OpenAI DALL-E 2 API integration
- Image generation workflow development
- ImageKit integration for image storage and delivery
- Error handling and rate limiting

### Core Features Implementation

- Image generation system with advanced options
- User management and authentication flow
- Credit based system with Stripe integration
- Image history and management functionality

### UI/UX Development

- Intuitive generation form with real time validation
- Responsive gallery view with pagination
- Loading states and error handling
- Toast notifications for user feedback

### Testing & Optimization

- Error boundary implementation
- Rate limiting and usage constraints
- Performance optimization for image loading
- Payment flow testing and webhook validation

## Project Structure

```
imagic/
prisma/                 # Database schema and migrations
├── schema.prisma       # Prisma database schema
src/
├── actions/                 # Server actions for database operations
│   ├── actions.ts          # Image generation and user management
│   ├── auth.ts             # Authentication-related actions
│   ├── billing.ts          # Payment and subscription management
│   └── data.ts             # Data fetching and manipulation
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── billing/            # Billing and subscription pages
│   ├── generate/           # Image generation interface
│   ├── history/            # User generation history
│   ├── pricing/            # Pricing plans and purchase flow
│   └── sign-out/           # Sign-out handling
├── components/             # Reusable React components
│   ├── billing/            # Billing-related components
│   ├── generate/           # Image generation components
│   └── ui/                 # UI utility components
├── lib/                    # Utility libraries and configurations
│   ├── constants.ts        # Application constants
│   ├── ai-model.ts         # OpenAI DALL-E 2 integration
│   ├── imagekit.ts         # ImageKit configuration
│   ├── prisma.ts           # Prisma client configuration
│   ├── stripe.ts           # Stripe configuration
│   ├── utils.ts            # Utility functions
│   └── validations.ts      # Zod validation schemas
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- ImageKit account
- Stripe account
- Clerk account

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/imagic.git
cd imagic
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your environment variables
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/imagic"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
NEXT_PUBLIC_IMAGEKIT_ENDPOINT="https://ik.imagekit.io/yourid"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_CREATOR_PRICE_ID="price_..."
STRIPE_PROFESSIONAL_PRICE_ID="price_..."
STRIPE_UNLIMITED_PRICE_ID="price_..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the development server

```bash
npm run dev
```

6. Open http://localhost:3000 in your browser

## API Costs

- **DALL-E 2 (512x512):** ~$0.018 per image
- Approximately 55 images per $1
- Cost-effective solution for high-volume generation

## Future Enhancements

- Multiple image size options (256x256, 1024x1024)
- Image editing and variations
- Batch generation capabilities
- Advanced filtering and search in history
- Social sharing features
- API access for developers
