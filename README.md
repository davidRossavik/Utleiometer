# Utleiometer

![Demo](./docs/utleiometer-gif.gif)

## About

**Utleiometer** is a comprehensive rental property review and rating platform built with modern web technologies. Users can register rental properties, leave detailed reviews with ratings on location, noise, landlord quality, and overall condition, and discover insights about housing experiences across Norway.

This platform empowers renters to share their experiences and help others make informed housing decisions while providing property owners with valuable feedback.

## Key Features

- **Property Management**: Register and browse rental properties with detailed information (area, bedrooms, bathrooms, build year)
- **Comprehensive Reviews**: Leave structured reviews with category ratings (location, noise, landlord, condition, overall)
- **Image Support**: Upload photos for properties and reviews (permanent Firebase storage)
- **Search & Filter**: Advanced search by location, ratings, property type, and area
- **Interactive Maps**: View property locations using Leaflet maps with geocoding
- **Multi-language**: Full support for Norwegian and French with seamless language switching
- **Admin Dashboard**: Manage users, handle reported reviews, and maintain data integrity
- **Authentication**: Secure Firebase authentication with role-based access control
- **Real-time Data**: Firestore-backed data synchronization

## Technology Stack

**Frontend:**
- Next.js 16 (React 19.2)
- TypeScript
- Tailwind CSS + Radix UI components
- Leaflet for interactive maps
- next-intl for i18n

**Backend:**
- Next.js API routes & Server Actions
- Firebase Admin SDK
- Firestore database
- Firebase Storage with permanent download URLs
- Firebase Authentication

**Developer Tools:**
- ESLint & TypeScript for code quality
- Vitest for unit testing
- Git-based workflow with structured commit guidelines

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Admin SDK credentials

### Installation

1. Navigate to the project directory:
```bash
cd utleiometer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then fill in your Firebase credentials in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building & Deployment

```bash
npm run build
npm run start
```

## Architecture

See [technical documentation](./docs/technical-details/) for:
- [Architecture overview](./docs/technical-details/architecture/README.md)
- [Authentication flow](./docs/technical-details/authentication/README.md)
- [Page flows & navigation](./docs/technical-details/page-flows/README.md)
- [Server-client communication](./docs/technical-details/server-client/README.md)

## Development Guidelines

- [Commit guidelines](./docs/commit-guidelines.md)
- [Git practices](./docs/git-practices.md)

## Project Structure

```
.
├── docs/                          # Documentation and assets
│   ├── commit-guidelines.md
│   ├── git-practices.md
│   ├── utleiometer-gif.gif       # Demo animation
│   └── technical-details/         # Technical architecture docs
├── utleiometer/                   # Next.js application
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   ├── features/             # Feature modules (properties, reviews, auth, etc.)
│   │   ├── lib/                  # Shared utilities and Firebase integration
│   │   ├── ui/                   # UI components
│   │   └── tests/                # Unit and integration tests
│   ├── public/                   # Static assets
│   ├── messages/                 # i18n translations (Norwegian, French)
│   └── package.json
└── README.md                      # This file
```

## Team

Developed as part of a software engineering course at NTNU, Spring 2026.
