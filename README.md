# ♟️ ROOKNOMICS

<div align="center">

### **Institutional-Grade Algorithmic Trading & Quantitative Strategy Engine**

*Design, backtest, analyze, and optimize trading strategies with real-time market data, interactive risk dashboards, and automated AI strategy verdicts.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-5.2-000000.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.1-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.11-764ABC.svg?logo=redux)](https://redux-toolkit.js.org/)

---

[Key Features](#-key-features) • [Architecture](#-architecture--monorepo-structure) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Metrics & Indicators](#-metrics--indicators-engine) • [License](#-license)

</div>

---

## 🌟 Overview

**Rooknomics** is a full-stack quantitative financial analytics and algorithmic backtesting engine built for traders, analysts, and developers. It allows users to build technical trading rules (RSI, Moving Average Crossovers), simulate trade executions against historical equity price data, and compare performance against benchmark indices like the **S&P 500**.

With an intuitive dark-themed UI, interactive Recharts visualization, multi-axis risk radar charts, and an automated **AI Verdict Engine**, Rooknomics empowers users to make data-driven investment decisions without writing code.

---

## ✨ Key Features

### 🛠️ Interactive Strategy Builder
* **Asset Selection**: Support for major equities and tickers (AAPL, MSFT, TSLA, NVDA, GOOGL, etc.).
* **Custom Backtest Windows**: Flexible date pickers and adjustable initial starting capital ($1,000 – $1,000,000+).
* **Technical Indicators Engine**:
  * **RSI (Relative Strength Index)**: Customizable period, buy oversold threshold, sell overbought threshold.
  * **Moving Average Crossover**: Dual SMA / EMA support with adjustable fast and slow period windows.

### 📊 Advanced Results & Risk Analytics Dashboard
* **Equity Growth Overlay**: Interactive dual-line chart comparing strategy equity curve against the **S&P 500 Buy & Hold** benchmark.
* **Key Performance Metrics (KPIs)**:
  * Total Return & CAGR / Annualized Return
  * S&P 500 Benchmark Return & Value Delta
  * Maximum Drawdown (MDD) %
  * Sharpe Ratio & Daily Volatility %
  * Win Rate %, Profit Factor, & Average Holding Days
* **5-Axis Risk Radar**: Multi-dimensional risk score evaluating Returns, Stability, Drawdown, Costs, and Simplicity.
* **Granular Trade Log**: Full execution ledger with entry/exit dates, BUY/SELL signals, fill prices, share counts, trade PnL, PnL %, and running portfolio valuation.

### 🤖 Automated AI Strategy Verdict Engine
* Evaluates strategy outcomes: `OUTPERFORMED`, `UNDERPERFORMED`, `NO_SIGNIFICANT_DIFFERENCE`, or `STRATEGY_INACTIVE`.
* Generates actionable insights, warning against trade churn, premature exit timing, excessive drawdowns, or unrewarded volatility risk.

### 🔐 Secure Auth & User Management
* **Dual Auth Options**: Password-less OTP email verification (via Resend) or one-click **Google OAuth 2.0**.
* **JWT Cookie Session Management**: Secure HTTP-only cookies and Authorization Bearer header support.
* **Personalized User Dashboard**: Save, review, reload, or delete past backtest simulations.

### 📚 Education & Financial Intelligence
* **Quantitative Learning Hub**: Interactive guides explaining key technical indicators, risk metrics, and strategy formulation.
* **Market News Hub**: Live news aggregator with category filtering and publication timelines.

---

## 🏗 Architecture & Monorepo Structure

Rooknomics is structured as a modular TypeScript monorepo split into high-performance `client` and `server` applications:

```text
Rooknomics/
├── client/                     # React 18 + Vite Frontend App
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Modular UI & Chart components
│   │   │   ├── AuthDialog.tsx            # Login / Register / OTP Modal
│   │   │   ├── BuilderView.tsx           # Interactive Strategy Builder Form
│   │   │   ├── LandingView.tsx           # Hero section & Platform showcase
│   │   │   ├── MetricsComparisonChart.tsx# Strategy vs Benchmark comparison
│   │   │   ├── ProfileView.tsx           # User profile & saved backtests history
│   │   │   ├── ResultDashboard.tsx       # Comprehensive analytics dashboard
│   │   │   ├── ScrollCandlestickChart.tsx# Scrollable interactive price chart
│   │   │   └── ui/                       # Radix UI primitives & design tokens
│   │   ├── data/               # Mock data & fallback presets
│   │   ├── hooks/              # Custom React hooks (useAuth, useMarketNews)
│   │   ├── lib/                # Utility helpers & Framer Motion variants
│   │   ├── pages/              # Primary route views (Index, Learn, NotFound)
│   │   ├── store/              # Redux Toolkit store (authSlice, backtestSlice)
│   │   ├── types/              # Frontend TypeScript contracts
│   │   ├── App.tsx             # Main App layout & routing providers
│   │   └── main.tsx            # Application entrypoint
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + MongoDB Backend
│   ├── docs/                   # Full REST API Endpoint documentation
│   │   └── API_ENDPOINTS.md
│   ├── src/
│   │   ├── api/                # Market data fetchers (Yahoo Finance API integration)
│   │   │   ├── fetchPrice.ts             # Stock candle fetcher & in-memory cache
│   │   │   ├── fetchSP500.ts             # S&P 500 index price fetcher
│   │   │   ├── prepareMarketData.ts      # Aggregator & indicator dataset prep
│   │   │   └── prices.ts                 # Real-time prices API handler
│   │   ├── backtest/           # Core Quantitative Backtest Engine
│   │   │   ├── createBacktestInput.ts    # Input transformer
│   │   │   ├── metrics.ts                # Financial metrics (Sharpe, Drawdown, PnL)
│   │   │   ├── rules.ts                  # Signal triggers (RSI, MA Cross)
│   │   │   ├── runBacktest.ts            # Trade execution simulator
│   │   │   └── types.ts                  # Backtest domain interfaces
│   │   ├── config/             # DB connection (MongoDB Mongoose)
│   │   ├── controller/         # Request handlers (Auth, Backtest, User)
│   │   ├── engine/             # Technical Indicator algorithms (SMA, EMA, RSI, BB)
│   │   │   └── indicator.ts
│   │   ├── middleware/         # Auth & cookie verification middleware
│   │   ├── models/             # Mongoose schemas (User, Backtest, Simulation, PendingOTP)
│   │   ├── routes/             # Express API routes definition
│   │   │   ├── authRoutes.ts             # Authentication endpoints
│   │   │   ├── userRoutes.ts             # User profile endpoints
│   │   │   ├── simulationRoutes.ts       # Simulation persistence endpoints
│   │   │   └── routes.ts                 # Master router setup
│   │   └── index.ts            # Core backtest handler entrypoint
│   ├── package.json
│   └── tsconfig.json
└── LICENSE
```

---

## 🛠 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | UI architecture with full type safety |
| **Build Tool & Bundler** | Vite 5 | Fast HMR & optimized production build pipeline |
| **Styling & Components** | Tailwind CSS + Radix UI | Utility-first styling & accessible UI primitives |
| **Animations** | Framer Motion | Smooth component transitions and UI micro-interactions |
| **State Management** | Redux Toolkit + React Query | Global auth state management & cached API queries |
| **Data Visualization** | Recharts | Financial equity charts, trade markers, & risk radar |
| **Backend Runtime** | Node.js + Express 5 | Asynchronous RESTful API backend engine |
| **Database & ORM** | MongoDB + Mongoose 9 | NoSQL database for users, OTPs, and saved backtests |
| **Authentication** | JWT + Google OAuth + Resend | HTTP-Only cookie JWT auth, Google login, & email OTP |
| **Market Data Source** | Yahoo Finance API | Live daily stock candles & benchmark price data |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` or `bun`
- **MongoDB**: A running local MongoDB instance or MongoDB Atlas URI.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/vardaansinghal17/ROOKNOMICS.git
cd ROOKNOMICS
```

### 2️⃣ Configure Environment Variables

#### Backend Environment Setup (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/rooknomics
JWT_SECRET=your_super_secret_jwt_key_here
RESEND_API_KEY=re_your_resend_api_key
CORS_ORIGINS=http://localhost:8080,http://localhost:5173
CLIENT_URL=http://localhost:8080
ALPHA_VANTAGE_API=optional_key
```

#### Frontend Environment Setup (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:3000
```

---

### 3️⃣ Installation & Running Locally

#### Option A: Running Backend (`server`)
```bash
cd server
npm install
npm run dev
```
*The server will start listening at `http://localhost:3000`.*

#### Option B: Running Frontend (`client`)
```bash
cd client
npm install
npm run dev
```
*The client app will launch at `http://localhost:8080` (or `http://localhost:5173`).*

---

## 📡 API Documentation

Rooknomics features a structured REST API for authentication, price fetching, backtest execution, and user history persistence.

### Key API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Send OTP email for account registration | No |
| `POST` | `/api/auth/verify-otp` | Verify OTP & complete account creation | No |
| `POST` | `/api/auth/login` | Authenticate user & set session cookie | No |
| `POST` | `/api/auth/google` | Authenticate via Google OAuth 2.0 | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Cookie) |
| `POST` | `/api/auth/logout` | Clear user auth session cookie | Yes (Cookie) |
| `GET` | `/api/prices` | Fetch historical candle prices for symbol | No |
| `POST` | `/api/backtest` | Execute a quantitative backtest simulation | Optional |
| `POST` | `/api/backtests` | Execute & save backtest to user profile | Yes (Bearer Token) |
| `GET` | `/api/backtests` | Fetch paginated saved backtests | Yes (Bearer Token) |
| `DELETE`| `/api/backtests/:id` | Delete a saved backtest record | Yes (Bearer Token) |

> 📖 *For complete payload examples and response schemas, refer to [API_ENDPOINTS.md](server/docs/API_ENDPOINTS.md).*

---

## 📈 Metrics & Indicators Engine

### Supported Indicators
- **SMA (Simple Moving Average)**: Calculates the average close price over a rolling window $N$.
$$\text{SMA}_t = \frac{1}{N} \sum_{i=0}^{N-1} P_{t-i}$$
- **EMA (Exponential Moving Average)**: Applies exponentially decreasing weights to past prices.
$$\text{EMA}_t = P_t \times \left(\frac{2}{N+1}\right) + \text{EMA}_{t-1} \times \left(1 - \frac{2}{N+1}\right)$$
- **RSI (Relative Strength Index)**: Measures momentum on a 0-100 scale using average gain vs. loss.
$$\text{RSI} = 100 - \left( \frac{100}{1 + \frac{\text{Average Gain}}{\text{Average Loss}}} \right)$$
- **Bollinger Bands**: Visualizes volatility bands placed 2 standard deviations away from a 20-period SMA.

### Evaluated Risk & Return Metrics
- **Sharpe Ratio**: Risk-adjusted excess return over annualized daily volatility ($\sqrt{252}$).
- **Max Drawdown (MDD)**: The maximum observed peak-to-trough drop in strategy portfolio value.
- **Profit Factor**: Gross profits generated divided by gross losses incurred.
- **Value at Risk (VaR 5%)**: 5th percentile worst daily return scenario.

---

## 🧪 Testing

Run frontend unit tests and end-to-end browser tests:

```bash
# In client/
npm run test           # Run unit tests with Vitest
npx playwright test    # Run E2E integration tests with Playwright
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ by <b>Vardan Singhal</b> and the Rooknomics Team.</sub>
</div>
