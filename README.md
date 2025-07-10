# Rhythm90 - Marketing Signals Platform

A comprehensive platform for tracking, analyzing, and acting on marketing insights with AI-powered recommendations and collaborative tools.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📁 Project Structure

```
rhythm90/
├── src/
│   ├── frontend/          # React frontend
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── backend/           # Cloudflare Worker backend
├── migrations/            # Database migrations
├── docs/                  # Documentation
└── worker/               # Worker configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8787
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
CRISP_WEBSITE_ID=your_crisp_id
```

### Crisp Chat Setup

1. Sign up for a free Crisp account at [crisp.chat](https://crisp.chat)
2. Get your Website ID from the Crisp dashboard
3. Update `CRISP_WEBSITE_ID` in your environment variables
4. The chat widget will appear on all pages automatically

### Marketing Page

The marketing page is located at `/marketing` and `/product` (both routes serve the same page).

**To edit marketing content:**
- Main content: `src/frontend/pages/Marketing.tsx`
- Copy and assets: `docs/MARKETING_LAUNCH.md`
- Navigation: `src/frontend/components/Navbar.tsx`

## 🗄️ Database

The application uses Cloudflare D1 database. Run migrations with:

```bash
npx wrangler d1 execute rhythm90-db --file=migrations/XXXX_migration_name.sql --remote
```

## 🚀 Deployment

1. Push to GitHub to trigger Cloudflare Workers deployment
2. Run database migrations on remote D1 database
3. Update environment variables in Cloudflare dashboard

## 📚 Documentation

- [Beta Launch Checklist](docs/BETA_LAUNCH_CHECKLIST.md) - Complete launch preparation guide
- [Marketing Launch Assets](docs/MARKETING_LAUNCH.md) - Marketing copy and assets
- [API Documentation](docs/API.md) - Backend API reference

## 🛠️ Development

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components

### Backend
- Cloudflare Workers
- D1 database
- Stripe integration
- OpenAI API integration

### Key Features
- Team invitation system with role management
- Admin audit logging
- Stripe billing integration
- AI-powered insights
- Real-time notifications
- Marketing signal tracking

## 📞 Support

- Email: support@rhythm90.io
- Help Center: `/help`
- Live Chat: Available on all pages via Crisp widget

## 📄 License

Private - All rights reserved
