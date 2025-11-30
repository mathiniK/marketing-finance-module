# Marketing & Finance Module - Backend

RESTful API built with Node.js, Express, and MongoDB for managing marketing campaigns, financial transactions, invoices, and generating reports.

## 🚀 Features

- **Campaign Management** - Track marketing campaigns with leads, conversions, and ROI
- **Transaction Management** - Manage income and expenses with categories
- **Invoice Management** - Create, track, and manage invoices
- **Dashboard APIs** - Get financial and marketing summaries
- **Reports** - Generate comprehensive financial and marketing reports

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository** (if not already done)

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and update the values:
   ```env
   MONGO_URI=mongodb://localhost:27017/marketing-finance
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. **Start MongoDB:**
   
   Make sure MongoDB is running locally on your system:
   
   **Windows:**
   ```powershell
   net start MongoDB
   ```
   
   **Mac/Linux:**
   ```bash
   sudo systemctl start mongod
   # OR
   mongod
   ```
   
   **Verify connection with MongoDB Compass:**
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - You should see your databases listed

## 🎯 Running the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🌱 Seed Sample Data

To populate the database with sample data for testing:

```bash
npm run seed
```

This will create:
- 6 marketing campaigns
- 32 transactions (income and expenses)
- 5 invoices

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### **Campaigns**
- `GET /campaigns` - Get all campaigns (with optional filters)
- `GET /campaigns/:id` - Get single campaign
- `POST /campaigns` - Create new campaign
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign
- `GET /campaigns/stats/overview` - Get campaign statistics

#### **Transactions**
- `GET /transactions` - Get all transactions (with optional filters)
- `GET /transactions/:id` - Get single transaction
- `POST /transactions` - Create new transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `GET /transactions/income/summary` - Get income summary
- `GET /transactions/expense/summary` - Get expense summary

#### **Invoices**
- `GET /invoices` - Get all invoices (with optional filters)
- `GET /invoices/:id` - Get single invoice
- `POST /invoices` - Create new invoice
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice
- `PATCH /invoices/:id/pay` - Mark invoice as paid
- `GET /invoices/stats/overview` - Get invoice statistics

#### **Dashboard**
- `GET /dashboard/overview` - Get quick overview stats
- `GET /dashboard/summary` - Get financial summary
- `GET /dashboard/marketing` - Get marketing summary

#### **Reports**
- `GET /reports/financial` - Get financial report
- `GET /reports/marketing` - Get marketing report
- `GET /reports/invoices` - Get invoice report
- `GET /reports/comprehensive` - Get comprehensive report

### Query Parameters

Most endpoints support filtering via query parameters:
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `type` - Filter by type (income/expense)
- `category` - Filter by category
- `status` - Filter by status
- `platform` - Filter by platform (for campaigns)

**Example:**
```
GET /api/transactions?type=income&startDate=2024-01-01&endDate=2024-12-31
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── Campaign.js          # Campaign schema
│   │   ├── Transaction.js       # Transaction schema
│   │   └── Invoice.js           # Invoice schema
│   ├── controllers/
│   │   ├── campaignController.js
│   │   ├── transactionController.js
│   │   ├── invoiceController.js
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── campaigns.js
│   │   ├── transactions.js
│   │   ├── invoices.js
│   │   ├── dashboard.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── errorHandler.js      # Global error handler
│   ├── seed.js                  # Database seeder
│   └── server.js                # Express app entry point
├── .env                         # Environment variables (create from .env.example)
├── .env.example                 # Example environment variables
├── package.json
└── README.md
```

## 🐛 Error Handling

The API uses a global error handler that returns consistent JSON responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Error message"
}
```

## 💡 Key Features Explained

### Campaign ROI Calculation
Cost per lead and ROI are automatically calculated when saving campaigns:
- **Cost per Lead** = Budget / Leads Generated
- **Conversion Rate** = (Conversions / Leads Generated) × 100

### Transaction Categories
- **Income**: project, invoice, deposit, other
- **Expense**: salary, subscription, marketing, utilities, other

### Invoice Status
- **Paid** - Payment received
- **Pending** - Awaiting payment
- **Overdue** - Past due date (automatically set)

### Automatic Calculations
- Invoice totals are calculated automatically from line items
- Tax is calculated based on tax rate
- Invoice status is updated to "overdue" if past due date

## 📝 Notes

- The API uses MongoDB aggregation pipelines for complex queries and statistics
- All dates should be in ISO 8601 format
- Monetary amounts are stored as numbers (no currency symbol)
- Invoice numbers are auto-generated (INV-0001, INV-0002, etc.)


