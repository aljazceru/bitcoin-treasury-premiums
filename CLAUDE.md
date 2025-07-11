# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Bitcoin Treasury Tracker web application built with Next.js that displays publicly traded companies holding Bitcoin and calculates their NAV premiums/discounts. The application features:
- **Full-Stack Next.js**: Single application with SSR and API routes
- **Database**: SQLite database for data persistence
- **Data Sources**: Real-time scraping from BitcoinTreasuries.net, CoinGecko API, and Yahoo Finance

## Project Structure

```
app/                              # Single Next.js application
├── src/
│   ├── components/               # React components
│   ├── pages/                    # Next.js pages and API routes
│   │   ├── api/                  # API endpoints (replaced Express backend)
│   │   │   ├── companies/        # Company data endpoints
│   │   │   ├── bitcoin-price.ts  # Bitcoin price endpoint
│   │   │   ├── market-status.ts  # Market status endpoint
│   │   │   ├── update-prices.ts  # Manual price updates
│   │   │   ├── price-history.ts  # Historical data
│   │   │   └── health.ts         # Health check
│   │   ├── _app.tsx              # App wrapper with React Query
│   │   └── index.tsx             # Main page
│   ├── services/                 # Business logic (price fetching, scraping, calculations)
│   ├── models/                   # Database models and types
│   ├── scrapers/                 # Web scraping logic
│   ├── utils/                    # Utilities (logging, etc.)
│   └── lib/                      # App initialization and startup
├── data/                         # SQLite database files
├── logs/                         # Application logs
├── tests/                        # All tests (components, API, services)
├── package.json                  # Merged dependencies
├── next.config.js                # Next.js configuration
└── Dockerfile                    # Single container build
docker-compose.yml                # Single service deployment
.env                              # Simplified environment config
.env.example                      # Environment template
```

## Development Commands

### Application
```bash
cd app
npm install
npm run dev          # Start development server (includes API routes)
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests (Vitest)
npm run test:jest    # Run Jest tests for services
npm run lint         # Run Next.js ESLint
```

### Running Full Application
1. Start the app: `cd app && npm run dev` (runs on port 3000)
2. API routes are available at `/api/*` endpoints
3. Everything runs in a single Next.js process
4. Scheduled tasks start automatically

## Architecture & Key Patterns

### Application Architecture
- **Next.js 14** full-stack application with TypeScript
- **Server-Side Rendering (SSR)** for better SEO and performance
- **API Routes** replacing Express.js backend
- **SQLite** database with custom Database class wrapper
- **Scheduled tasks** using node-cron for data updates
- **Winston** logging with file and console outputs

### Data Flow
1. **Company Holdings**: Scraped from BitcoinTreasuries.net every 6 hours
2. **Bitcoin Price**: Fetched from CoinGecko API every 30 minutes
3. **Stock Prices**: Fetched from Yahoo Finance API every 30 minutes (market hours only)
4. **Calculations**: NAV and premium/discount calculated in real-time

### Frontend Architecture
- **Next.js 14** with Server-Side Rendering (SSR)
- **React Query** for data fetching, caching, and synchronization
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for HTTP requests to internal API routes

### Database Schema
```sql
companies (id, name, ticker, exchange, country_code, btc_holdings, shares_outstanding, last_holdings_update)
stock_prices (id, ticker, price, currency, timestamp)
bitcoin_prices (id, price, currency, timestamp)
```

## Key Features Implementation

### Scheduled Updates
- **30-minute intervals**: Bitcoin and stock prices
- **6-hour intervals**: Company holdings data
- **Market hours detection**: Stock updates only during NYSE hours (9:30-16:00 ET)

### Premium/Discount Calculation
```
NAV per Share = (BTC Holdings × Bitcoin Price) ÷ Total Shares Outstanding
Premium/Discount = ((Stock Price - NAV per Share) ÷ NAV per Share) × 100
```

### Error Handling
- **Graceful degradation**: Uses last known prices on API failures
- **Rate limit compliance**: Respects free API tier limits
- **Fallback mechanisms**: Multiple data source attempts

### Real-time Features
- **Auto-refresh**: Data updates every 30 minutes
- **Manual refresh**: User-triggered updates
- **Live status**: Market open/closed indicators
- **Error states**: User-friendly error messages

## API Endpoints (Next.js API Routes)

- `GET /api/companies` - Get all companies with calculated metrics
- `GET /api/companies/[ticker]` - Get specific company data
- `GET /api/bitcoin-price` - Get current Bitcoin price
- `GET /api/market-status` - Check if US stock market is open
- `POST /api/update-prices` - Manually trigger price updates
- `GET /api/price-history?hours=24` - Get historical price data
- `GET /api/health` - Health check endpoint

## Environment Variables

### Application (.env)
```
# Single configuration for entire application
NODE_ENV=production
DOMAIN=premiums.cypherpunk.cloud

# Ports
FRONTEND_PORT=3000

# Database
DATABASE_PATH=/app/data/treasury.db

# External APIs
COINGECKO_API_URL=https://api.coingecko.com/api/v3
YAHOO_FINANCE_API_URL=https://query1.finance.yahoo.com/v8/finance
BITCOIN_TREASURIES_URL=https://bitcointreasuries.net

# Update intervals (minutes)
BITCOIN_PRICE_UPDATE_INTERVAL=30
STOCK_PRICE_UPDATE_INTERVAL=30
HOLDINGS_UPDATE_INTERVAL=360

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_DIR=/app/logs

# Docker
APP_DATA_PATH=./app/data
APP_LOGS_PATH=./app/logs
```

**Key Simplifications:**
- No separate frontend/backend configuration needed
- Single `DOMAIN` variable drives all URLs
- No `REACT_APP_API_URL` needed (uses relative paths)

## Testing

### Application Tests
- **Unit tests** for services (Bitcoin price, stock price, company data)
- **Integration tests** for API routes
- **Database tests** with in-memory SQLite
- **Component tests** for React components
- **Mocked external APIs** for reliable testing

### Running Tests
```bash
# Component and integration tests
cd app && npm test

# Service and API tests
cd app && npm run test:jest
```

## Common Development Tasks

### Adding a New Company
1. Company will be automatically discovered by the scraper
2. Manual addition: Add to database via API or direct SQL

### Modifying Update Intervals
- Change environment variables in `.env`
- Restart application

### Adding New Calculated Fields
1. Update TypeScript interfaces in `app/src/models/types.ts`
2. Modify calculation logic in `companyService.getTreasuryData()`
3. Update frontend components to display new fields

### Debugging Data Issues
1. Check logs in `app/logs/`
2. Query database directly: `sqlite3 app/data/treasury.db`
3. Use `/api/update-prices` endpoint to manually trigger updates

## Deployment Considerations

### Application Deployment
- **Environment**: Node.js 18+
- **Architecture**: Single Next.js application (simplified from 2-service setup)
- **Database**: SQLite file (ensure persistent storage)
- **Scheduled Tasks**: Automatically start with the application
- **Logs**: Configure log rotation for production

### Production Build
- **Build**: `npm run build` creates optimized Next.js application
- **Output**: Standalone mode for containerized deployment
- **Assets**: Static files served by Next.js
- **API**: Internal API routes (no external backend needed)

### Production Monitoring
- **Health Checks**: Use `/api/health` endpoint
- **Error Monitoring**: Monitor application logs in `app/logs/`
- **API Limits**: Track usage of external APIs
- **Database Size**: Monitor SQLite file growth

## Security Notes

- **Rate Limiting**: Configured for API endpoints
- **Input Validation**: All API inputs validated
- **Error Handling**: Sensitive errors not exposed to clients
- **Server-side Security**: All sensitive operations happen server-side

## Migration Notes

This application was migrated from a separate backend/frontend architecture to a unified Next.js application:

**Before:**
- Express.js backend + React frontend (2 containers)
- Complex environment variable management
- Network calls between services

**After:**
- Single Next.js application (1 container)
- Simplified configuration with single `DOMAIN` variable
- Direct function calls between frontend and backend logic
- 50% reduction in deployment complexity