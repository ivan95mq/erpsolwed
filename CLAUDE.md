# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based landing page for ERP SOLWED (erpsolwed.es), a cloud ERP service for Spanish SMEs and freelancers. The site features a modern, animated UI with a client search system that allows existing customers to access their ERP subdomain instances.

## Tech Stack

- **Framework**: Astro 4.0 with React integration
- **Styling**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **Language**: TypeScript
- **Site URL**: https://erpsolwed.es

## Development Commands

```bash
# Start development server
npm run dev
# or
npm start

# Build for production (includes prebuild script)
npm run build

# Preview production build
npm run preview
```

## Build Process

The `prebuild` script (`npm run build`) automatically runs `scripts/update-clients.js` before building. This script:
- Connects via SSH to the production server (server0)
- Queries Plesk for all active `*.erpsolwed.es` subdomains
- Updates the `erpClients` array in `src/components/Navbar.astro`
- Fails gracefully if SSH connection fails (doesn't block build)

**Important**: If the SSH connection fails during local development, the build will continue with the existing client list.

## Architecture

### Page Structure
- Single-page landing site at `src/pages/index.astro`
- Layout wrapper: `src/layouts/Layout.astro` (handles SEO, meta tags, global styles)
- Component-based sections: Navbar, Hero, Features, Pricing, FAQ, CTA, Footer

### Client Search System
The interactive client search is split between:
- **Navbar.astro**: Contains the `erpClients` array (auto-updated via prebuild)
- **ClientSearch.tsx**: React component with autocomplete dropdown that:
  - Filters clients with normalized search (removes accents, special chars)
  - Redirects to `https://{client}.erpsolwed.es` on selection
  - Shows animated dropdown with client list
  - Handles both desktop and mobile layouts

### Styling System

**Brand Colors** (defined in `tailwind.config.mjs`):
- Primary: `#2E3536` (dark gray)
- Secondary: `#F2E500` (yellow)
- Dark: `#0b0b0b`
- Light: `#ffffff`

**DaisyUI Theme**: Custom "solwed" theme configured in `tailwind.config.mjs`

**Custom Animations**:
- `shimmer`: 2s linear infinite background position animation
- `meteor`: 5s meteor effect animation
- `border-beam`: 4s border beam animation

### Magic UI Components
Located in `src/components/magicui/`:
- `BorderBeam.tsx`: Animated border effect
- `ShimmerButton.tsx`: Button with shimmer animation
- `NumberTicker.tsx`: Animated number counter
- `Meteors.tsx`: Meteor rain effect
- `Card3D.tsx`: 3D card hover effect
- `ScrollReveal.tsx`: Scroll-triggered animations
- `AnimatedGradient.tsx`: Gradient animation
- `AnimatedBackground.tsx`: Animated background patterns

These are reusable React components that provide visual effects throughout the landing page.

## File Organization

- `src/components/`: Astro and React components
  - `*.astro`: Main section components (Hero, Features, Pricing, FAQ, CTA, Footer, Navbar)
  - `*.old.astro`, `*.bk2`, `*_temp.astro`, `*_fixed.astro`: Legacy/backup files (safe to ignore)
  - `ClientSearch.tsx`: Interactive client search dropdown
  - `magicui/`: Reusable animation components
- `src/layouts/`: Base HTML layout with SEO
- `src/pages/`: Page routes (currently only index)
- `src/styles/global.css`: Global CSS imports
- `scripts/update-clients.js`: Prebuild script for syncing client list from server

## TypeScript Configuration

- Uses Astro's strict TypeScript config
- JSX configured for React (`react-jsx`, `jsxImportSource: "react"`)
- No additional path aliases configured

## Important Patterns

1. **Astro Islands**: React components (like `ClientSearch.tsx`) are embedded in Astro components with `client:load` directive for interactivity

2. **Client List Updates**: The client list in Navbar.astro should match the pattern:
   ```javascript
   const erpClients = ["client1", "client2", ...];
   ```
   This exact format is required for the update script to work.

3. **Responsive Design**: Components use conditional rendering/styling based on `isMobile` prop or Tailwind responsive classes

4. **Animation Performance**: Framer Motion animations are optimized with `AnimatePresence` for mount/unmount effects
