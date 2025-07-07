# Bitcoin Treasury Premium Tracker

A full-stack web application that tracks publicly traded companies holding Bitcoin and calculates their premium/discount to Net Asset Value (NAV). The application provides real-time data on Bitcoin treasury holdings with automated price updates.

![Bitcoin Treasury Premium Tracker](https://img.shields.io/badge/Bitcoin-Treasury%20Tracker-orange?logo=bitcoin)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd bitcoinpremiums.com

# Start production setup
./docker-setup.sh production

# Access the application
# Containers: Backend (localhost:3001), Frontend (localhost:3000)
# Configure your host nginx to proxy to these containers
```

### Manual Setup

```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
npm start
```

## 🏗️ Architecture

### Docker + Host Nginx Setup
```
Internet → Host Nginx → Docker Containers
                     ├── Backend Container (localhost:3001)
                     └── Frontend Container (localhost:3000)
```

### Technology Stack
- **Backend**: Node.js, Express, TypeScript, SQLite
- **Frontend**: React 18, TypeScript, Tailwind CSS, React Query
- **Data Sources**: CoinGecko API, Yahoo Finance API, Bitcoin Treasuries data
- **Deployment**: Docker with host nginx reverse proxy

## ⚙️ Configuration

### Single Environment File
All configuration is managed through one `.env` file:

```bash
# Domain Configuration
DOMAIN=premiums.cypherpunk.cloud
REACT_APP_API_URL=https://premiums.cypherpunk.cloud/api

# Container Ports
BACKEND_PORT=3001
FRONTEND_PORT=3000

# API Configuration
BITCOIN_PRICE_UPDATE_INTERVAL=30
STOCK_PRICE_UPDATE_INTERVAL=30
HOLDINGS_UPDATE_INTERVAL=360
```

### Host Nginx Configuration
Use the provided `host-nginx.conf` file for your nginx setup:

```bash
# Copy nginx configuration
sudo cp host-nginx.conf /etc/nginx/sites-available/premiums.cypherpunk.cloud
sudo ln -s /etc/nginx/sites-available/premiums.cypherpunk.cloud /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 📊 Features

### Real-time Data
- **Bitcoin Price**: Updated every 30 minutes from CoinGecko
- **Stock Prices**: Updated every 30 minutes from Yahoo Finance
- **Holdings Data**: Updated every 6 hours from Bitcoin treasuries sources

### Calculated Metrics
- **NAV per Share**: (BTC Holdings × Bitcoin Price) ÷ Shares Outstanding
- **Premium/Discount**: ((Stock Price - NAV per Share) ÷ NAV per Share) × 100
- **Market Capitalization**: Stock Price × Shares Outstanding
- **BTC Value**: BTC Holdings × Current Bitcoin Price

### User Interface
- **Sortable Tables**: Click headers to sort by any column
- **Real-time Updates**: Automatic data refresh every 30 minutes
- **Export Functionality**: Download data as CSV
- **Market Status**: Shows if US stock market is open/closed
- **Responsive Design**: Works on desktop and mobile

## 🔧 Development

### Environment Setup
```bash
# Use development configuration
cp .env.development .env
./docker-setup.sh development
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

### Hot Reload Development
The docker setup includes live reload for both frontend and backend when using development mode.

## 📋 API Endpoints

- `GET /api/companies` - Get all companies with calculated metrics
- `GET /api/companies/:ticker` - Get specific company data
- `GET /api/bitcoin-price` - Get current Bitcoin price
- `GET /api/market-status` - Check if US stock market is open
- `POST /api/update-prices` - Manually trigger price updates
- `GET /health` - Health check endpoint

## 🛡️ Security Features

- **Rate Limiting**: API requests are rate limited
- **CORS Protection**: Configured for specific domains
- **Input Validation**: All API inputs are validated
- **Security Headers**: Nginx adds security headers
- **Hidden Backend**: API only accessible through reverse proxy

## 🔄 Data Update Schedule

| Component | Frequency | Condition |
|-----------|-----------|-----------|
| Bitcoin Price | 30 minutes | Always |
| Stock Prices | 30 minutes | Market hours |
| Stock Prices | 2 hours | Market closed |
| Holdings Data | 6 hours | Always |

## 📁 Project Structure

```
├── .env                          # Single configuration file
├── docker-compose.yml            # Docker services definition
├── docker-setup.sh               # Automated setup script
├── host-nginx.conf               # Host nginx configuration
├── backend/
│   ├── src/
│   │   ├── controllers/          # API route handlers
│   │   ├── services/            # Business logic
│   │   ├── models/              # Database and types
│   │   └── utils/               # Utilities
│   └── tests/                   # Backend tests
└── frontend/
    ├── src/
    │   ├── components/          # React components
    │   ├── services/            # API client
    │   └── tests/               # Frontend tests
    └── public/                  # Static assets
```

## 🚀 Deployment

### Production Deployment
1. Configure your domain in `.env`
2. Start Docker containers: `./docker-setup.sh production`
3. Setup host nginx: Copy and enable `host-nginx.conf`
4. Configure SSL certificates (optional)

### Environment Variables for Production
Update these in your `.env` file:
- `DOMAIN`: Your production domain
- `REACT_APP_API_URL`: API URL through your nginx
- `RATE_LIMIT_MAX_REQUESTS`: Increase for production load

## 📖 Documentation

- **CLAUDE.md**: Detailed project instructions and architecture
- **DOCKER-HOST-NGINX.md**: Complete Docker + nginx setup guide
- **PRD.md**: Product requirements document

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. Always verify data independently before making investment decisions. The calculated premiums and discounts are based on available public data and may not reflect real-time market conditions.

## 🔗 Data Sources

- **Bitcoin Prices**: [CoinGecko API](https://www.coingecko.com/en/api)
- **Stock Prices**: [Yahoo Finance API](https://finance.yahoo.com/)
- **Holdings Data**: Bitcoin treasuries public sources

---

**Live Demo**: [https://premiums.cypherpunk.cloud](https://premiums.cypherpunk.cloud)