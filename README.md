# BKW Hackathon Frontend

A Next.js application for building energy analysis and optimization, featuring Excel file upload, room type optimization, and energy consumption calculations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MartinSteinmayer/bkw-hackathon-frontend.git
cd bkw-hackathon-frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure the API URL (optional):
```bash
cp .env.local.example .env.local
# Edit .env.local to change the backend URL if needed
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔧 Configuration

### Backend API URL

The application connects to a FastAPI backend. By default, it uses:
```
https://bkw-hackathon-backend.onrender.com
```

To change the backend URL:

1. Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

2. For local development with local backend:
```bash
NEXT_PUBLIC_API_URL=http://localhost:10000
```

The API URL is configured in `src/services/api.ts`.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── views/             # Page views (Home, Step1, Step2, Report)
│   ├── DownloadExcelButton.tsx
│   └── ...
├── contexts/              # React contexts (AnalysisContext)
└── services/              # API integration (api.ts)
```

## 🎯 Features

- **Excel Upload**: Upload heating and ventilation Excel files
- **Room Type Optimization**: AI-powered room classification
- **Energy Analysis**: Calculate energy consumption and savings
- **Data Export**: Download processed Excel files and PDF reports
- **Multi-step Workflow**: Guided analysis process with progress tracking

## 🔗 Backend Integration

The frontend communicates with a FastAPI backend that:
- Merges and processes Excel files
- Optimizes room type classifications
- Calculates energy metrics
- Returns base64-encoded Excel files

See `endpoints.md` and `IMPLEMENTATION_SUMMARY.md` for API documentation.

## 📚 Documentation

- `endpoints.md` - Backend API endpoint specifications
- `IMPLEMENTATION_SUMMARY.md` - Frontend implementation details
- `BASE64_EXCEL_GUIDE.md` - Excel file handling guide
- `PROJECT_OVERVIEW.md` - Project architecture overview

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://bkw-hackathon-backend.onrender.com`
4. Deploy

### Manual Build

```bash
pnpm build
pnpm start
```

## 🛠️ Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint
```

## 📝 License

MIT
