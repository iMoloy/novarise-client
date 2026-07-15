# NovaRise - Client

Live Site: https://novarise.vercel.app

This is the front-end client application for **NovaRise**, a futuristic crowdfunding launchpad built with Next.js, React, Tailwind CSS, and Framer Motion. It includes dashboards for Admins, Creators, and Supporters.

## Features

- **Futuristic Dark UI**: Modern sleek aesthetics with glassmorphism, glowing borders, and smooth animations.
- **Role-Based Routing**: Dynamic dashboard loading depending on user role (Admin, Creator, Supporter).
- **Google OAuth**: Integrated login using Firebase Authentication.
- **Campaign Exploration**: Real-time searching, category filtering, sorting, and reporting.
- **Contribution Escrow & Flow**: Supporters can contribution/pledge credits, with approval managed by creators.
- **Credit Purchase**: Integration with dummy Stripe payment form supporting 16-digit card validation.
- **Campaign Creation**: Dynamic form with ImgBB integration for image upload.
- **Notifications System**: Popover notifications showing real-time updates for approvals, rejections, and payments.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS**
- **Lucide Icons**
- **Framer Motion**
- **Firebase Authentication**

## Project Structure

```
src/
├── app/                  # Next.js App Router routes
│   ├── layout.tsx        # Root layout (context, navbar, footer)
│   ├── page.tsx          # Homepage
│   ├── login/page.tsx    # Login with Google / password
│   ├── register/page.tsx # Registration with ImgBB upload
│   ├── campaigns/
│   │   └── [id]/page.tsx # Campaign Details
│   └── dashboard/page.tsx# Dashboard selector
├── components/           # Shared UI components
│   └── dashboard/        # Dashboards (Admin, Creator, Supporter)
├── lib/                  # Firebase client configuration
└── context/              # Auth context for state management
```

## Environment Variables

Create `.env.local` inside `novarise-client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key

# Firebase Config for Google OAuth
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Local Development

```bash
npm install
npm run dev
```

The client runs on `http://localhost:3000`.
