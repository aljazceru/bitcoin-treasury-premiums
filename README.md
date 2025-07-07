# Bitcoin Treasury Premium Tracker

A full-stack web application that tracks publicly traded companies holding Bitcoin and calculates their premium/discount to Net Asset Value (NAV). The application scrapes real-time data from BitcoinTreasuries.net, fetches live Bitcoin prices from CoinGecko, and stock prices from Yahoo Finance.

![Bitcoin Treasury Premium Tracker](https://img.shields.io/badge/Bitcoin-Treasury%20Tracker-orange?logo=bitcoin)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)

## 🚀 Quick Start with Docker

The fastest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd bitcoinpremiums.com

# Start the application
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

That's it! The application will automatically:
- Start the backend API server
- Start the frontend React application
- Initialize the SQLite database
- Begin scraping and updating data every 30 minutes

## 📋 Features

### Real-Time Data Collection
- **Company Holdings**: Scraped from BitcoinTreasuries.net every 6 hours
- **Bitcoin Prices**: Fetched from CoinGecko API every 30 minutes
- **Stock Prices**: Fetched from Yahoo Finance API every 30 minutes (market hours only)

### Premium/Discount Calculations
- **NAV per Share**: `(BTC Holdings × Bitcoin Price) ÷ Total Shares Outstanding`
- **Premium/Discount**: `((Stock Price - NAV per Share) ÷ NAV per Share) × 100`

### Interactive Features
- **Sortable Table**: Click any column header to sort
- **Auto-Refresh**: Data updates every 30 minutes
- **Manual Refresh**: Force immediate data updates
- **CSV Export**: Download current data as CSV
- **Market Status**: Live NYSE market open/closed indicator
- **Error Handling**: Graceful degradation with last known prices

## 🏗️ Architecture

### Backend (Node.js/Express/SQLite)
```
backend/
├── src/
│   ├── controllers/    # API route handlers
│   ├── services/       # Business logic
│   │   ├── bitcoinPriceService.ts    # CoinGecko API integration
│   │   ├── stockPriceService.ts      # Yahoo Finance API integration
│   │   ├── companyService.ts         # Company data management
│   │   └── schedulerService.ts       # Cron job scheduling
│   ├── models/         # Database models and types
│   ├── scrapers/       # Web scraping logic
│   └── utils/          # Utilities (logging, etc.)
├── tests/              # Comprehensive test suite
└── data/               # SQLite database files
```

### Frontend (React/TypeScript/Tailwind)
```
frontend/
├── src/
│   ├── components/     # React components
│   │   └── BitcoinTreasuryTracker.tsx
│   ├── services/       # API client
│   │   └── api.ts      # Axios-based API service
│   └── App.tsx         # Main app with React Query
└── public/             # Static assets
```

### Database Schema
```sql
companies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT UNIQUE NOT NULL,
  exchange TEXT,
  country_code TEXT,
  btc_holdings REAL,
  shares_outstanding REAL,
  last_holdings_update TEXT
)

stock_prices (
  id INTEGER PRIMARY KEY,
  ticker TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
)

bitcoin_prices (
  id INTEGER PRIMARY KEY,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for containerized setup)

### Local Development (without Docker)

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev           # Start development server on port 3001
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start            # Start development server on port 3000
```

#### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Docker Development

#### Build and run with Docker Compose
```bash
# Development with hot reload
docker compose -f docker-compose.dev.yml up --build

# Production build
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

#### Individual container builds
```bash
# Build backend
docker build -t bitcoin-treasury-backend ./backend

# Build frontend
docker build -t bitcoin-treasury-frontend ./frontend

# Run backend
docker run -p 3001:3001 bitcoin-treasury-backend

# Run frontend
docker run -p 3000:3000 bitcoin-treasury-frontend
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_PATH=./data/treasury.db

# API Configuration
COINGECKO_API_URL=https://api.coingecko.com/api/v3
YAHOO_FINANCE_API_URL=https://query1.finance.yahoo.com/v8/finance

# Scraping Configuration
BITCOIN_TREASURIES_URL=https://bitcointreasuries.net
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

# Update Intervals (in minutes)
BITCOIN_PRICE_UPDATE_INTERVAL=30
STOCK_PRICE_UPDATE_INTERVAL=30
HOLDINGS_UPDATE_INTERVAL=360

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## 📊 API Documentation

### Endpoints

#### Companies
- `GET /api/companies` - Get all companies with calculated metrics
- `GET /api/companies/:ticker` - Get specific company data

#### Prices
- `GET /api/bitcoin-price` - Get current Bitcoin price
- `GET /api/price-history?hours=24` - Get historical price data

#### System
- `GET /api/market-status` - Check if US stock market is open
- `POST /api/update-prices` - Manually trigger price updates
- `GET /health` - Health check endpoint

### Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

## 🧪 Testing

### Backend Tests
- **Unit Tests**: Services, utilities, and business logic
- **Integration Tests**: API endpoints and database operations
- **Mocked APIs**: External API calls are mocked for reliability

```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run with coverage report
```

### Frontend Tests
- **Component Tests**: React component rendering and interactions
- **API Tests**: Service layer and data fetching

```bash
cd frontend
npm test                 # Run all tests
npm run test:coverage    # Run with coverage report
```

## 🚀 Deployment

### Production Deployment with Docker

#### Using Docker Compose (Recommended)
```bash
# Production deployment
docker compose -f docker-compose.prod.yml up -d

# Monitor logs
docker compose -f docker-compose.prod.yml logs -f
```

#### Manual Docker Deployment
```bash
# Build production images
docker build -t bitcoin-treasury-backend:prod ./backend
docker build -t bitcoin-treasury-frontend:prod ./frontend

# Run with production settings
docker run -d -p 3001:3001 --name backend bitcoin-treasury-backend:prod
docker run -d -p 3000:3000 --name frontend bitcoin-treasury-frontend:prod
```

### Cloud Deployment Options

#### Backend Deployment (Railway/Fly.io)
1. Set environment variables in deployment platform
2. Ensure persistent storage for SQLite database
3. Configure health check endpoint: `/health`

#### Frontend Deployment (Vercel/Netlify)
1. Build command: `npm run build`
2. Output directory: `build`
3. Set API URL environment variable

### Environment-Specific Configurations

#### Production
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set up log rotation
- Monitor database size

#### Staging
- Use separate database
- Enable debug logging
- Test with production-like data

## 📈 Monitoring & Maintenance

### Health Monitoring
- **Health Check**: `GET /health` endpoint
- **Database Status**: Monitor SQLite file size and growth
- **API Limits**: Track external API usage
- **Update Success**: Monitor cron job execution

### Logs
- **Backend Logs**: `backend/logs/` directory
- **Error Logs**: `backend/logs/error.log`
- **Combined Logs**: `backend/logs/combined.log`

### Database Maintenance
```bash
# Access SQLite database
sqlite3 backend/data/treasury.db

# Check table sizes
.tables
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM stock_prices;
SELECT COUNT(*) FROM bitcoin_prices;

# Clean old price data (older than 30 days)
DELETE FROM stock_prices WHERE timestamp < datetime('now', '-30 days');
DELETE FROM bitcoin_prices WHERE timestamp < datetime('now', '-30 days');
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update README for new features

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. The data provided should not be used as the sole basis for investment decisions. Always verify data independently and consult with financial professionals before making investment decisions.

## 🆘 Troubleshooting

### Common Issues

#### Docker Build Fails
```bash
# Clear Docker cache
docker system prune -a
docker compose down
docker compose up --build
```

#### Database Issues
```bash
# Reset database (WARNING: This deletes all data)
rm backend/data/treasury.db
docker compose restart backend
```

#### API Rate Limits
- CoinGecko: 10-30 calls/minute (free tier)
- Yahoo Finance: No official limits, but be respectful
- Check logs for rate limit errors

#### Frontend Not Loading
- Verify backend is running on port 3001
- Check network connectivity between containers
- Verify CORS configuration

### Getting Help
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review application logs
3. Verify API endpoints manually
4. Check Docker container status: `docker compose ps`

---

**Built with ❤️ for the Bitcoin community**