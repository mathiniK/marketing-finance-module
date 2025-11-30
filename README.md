# Marketing & Finance Module

A complete full-stack web application for managing marketing campaigns, financial transactions, and invoices. Built with the MERN stack (MongoDB, Express, React, Node.js).

## 🎯 Features

### Marketing Management
- ✅ Create and manage marketing campaigns
- ✅ Track leads, conversions, and ROI
- ✅ Platform-based analytics (Facebook, Google, Email, etc.)
- ✅ Cost per lead calculations
- ✅ Campaign performance visualization

### Financial Management
- ✅ Income tracking by category (projects, invoices, deposits)
- ✅ Expense tracking by category (salaries, subscriptions, marketing, utilities)
- ✅ Monthly profit/loss calculations
- ✅ Expense breakdown with charts
- ✅ Financial statements

### Invoice Management
- ✅ Professional invoice creation
- ✅ Line item management with automatic calculations
- ✅ Payment status tracking (paid, pending, overdue)
- ✅ Auto-generated invoice numbers
- ✅ Tax calculations
- ✅ Mark as paid functionality

### Dashboard & Analytics
- ✅ Real-time financial overview
- ✅ Interactive charts and graphs
- ✅ Key performance indicators (KPIs)
- ✅ Marketing campaign metrics
- ✅ Income vs expense trends

### Reports & Export
- ✅ Financial reports with date filtering
- ✅ Marketing performance reports
- ✅ Invoice reports
- ✅ Comprehensive business reports
- ✅ CSV export functionality
- ✅ PDF export functionality (react-pdf)
- ✅ Print-friendly layouts

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **dotenv** - Environment configuration
- **cors** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Material-UI (MUI)** - Component library
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **date-fns** - Date utilities

## 📦 Project Structure

```
marketing-finance-module/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # MongoDB connection
│   │   ├── models/
│   │   │   ├── Campaign.js           # Campaign schema
│   │   │   ├── Transaction.js        # Income/Expense schema
│   │   │   └── Invoice.js            # Invoice schema
│   │   ├── controllers/
│   │   │   ├── campaignController.js
│   │   │   ├── transactionController.js
│   │   │   ├── invoiceController.js
│   │   │   ├── dashboardController.js
│   │   │   └── reportController.js
│   │   ├── routes/
│   │   │   ├── campaigns.js
│   │   │   ├── transactions.js
│   │   │   ├── invoices.js
│   │   │   ├── dashboard.js
│   │   │   └── reports.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js       # Global error handler
│   │   ├── seed.js                   # Database seeder
│   │   └── server.js                 # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/               # Layout components
│   │   │   └── Common/               # Reusable components
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Marketing.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Invoices.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js                # API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
└── README.md (this file)
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **MongoDB Compass** (GUI) - [Download](https://www.mongodb.com/try/download/compass)
- **npm** or **yarn** - Comes with Node.js

### Installation

#### 1. Clone or Navigate to Project Directory
```bash
cd marketing-finance-module
```

#### 2. Set Up Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env    # Windows
# OR
cp .env.example .env      # Mac/Linux

# Edit .env file with your MongoDB connection string
# MONGO_URI=mongodb://localhost:27017/marketing-finance
```

#### 3. Set Up Frontend

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

### Running the Application

#### Option 1: Run Both Servers Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will start on `http://localhost:3000`

#### Option 2: Using Production Builds

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Seeding Sample Data

**Important:** Make sure MongoDB is running before seeding!

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This will create:
- 6 sample marketing campaigns
- 32 sample transactions (income and expenses)
- 5 sample invoices

**Note:** You can view the seeded data in MongoDB Compass by connecting to `mongodb://localhost:27017` and browsing the `marketing-finance` database.

### Accessing the Application

1. **Open your browser** and navigate to: `http://localhost:3000`
2. **The dashboard** will load showing all your data
3. **Navigate** using the sidebar to explore different sections

## 🔌 API Endpoints

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get single campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/stats/overview` - Get statistics

### Transactions
- `GET /api/transactions?type=income` - Get income
- `GET /api/transactions?type=expense` - Get expenses
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/income/summary` - Income summary
- `GET /api/transactions/expense/summary` - Expense summary

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get single invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PATCH /api/invoices/:id/pay` - Mark as paid
- `GET /api/invoices/stats/overview` - Get statistics

### Dashboard
- `GET /api/dashboard/overview` - Quick overview
- `GET /api/dashboard/summary` - Financial summary
- `GET /api/dashboard/marketing` - Marketing summary

### Reports
- `GET /api/reports/financial?startDate=&endDate=` - Financial report
- `GET /api/reports/marketing?startDate=&endDate=` - Marketing report
- `GET /api/reports/invoices?startDate=&endDate=` - Invoice report
- `GET /api/reports/comprehensive?startDate=&endDate=` - Comprehensive report

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running locally. Start it with `mongod` or start the MongoDB service:
- **Windows**: `net start MongoDB`
- **Mac/Linux**: `sudo systemctl start mongod`

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**: Change the PORT in backend `.env` file or kill the process using that port.

### CORS Errors
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**: Make sure CORS is enabled in backend and CLIENT_URL is correctly set in `.env`.

### Frontend Build Errors
```
Module not found: Error: Can't resolve...
```
**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
```






