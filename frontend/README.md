# Marketing & Finance Module - Frontend

Modern React frontend application built with Vite, Tailwind CSS, Material-UI, and Recharts for data visualization.

## 🚀 Features

- **Dashboard** - Overview with key metrics, charts, and trends
- **Marketing Management** - Track campaigns, leads, conversions, and ROI
- **Income Management** - Record and monitor income transactions
- **Expense Management** - Track expenses by category
- **Invoice Management** - Create, track, and manage invoices with payment status
- **Reports** - Generate comprehensive reports with CSV export

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🎯 Running the Application

### Development Mode (with hot reload):
```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Build for Production:
```bash
npm run build
```

### Preview Production Build:
```bash
npm run preview
```

## ⚙️ Configuration

The frontend is configured to proxy API requests to the backend server:
- Development API: `http://localhost:5000/api` (configured in `vite.config.js`)
- Make sure the backend server is running before starting the frontend

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.jsx          # Main layout with sidebar
│   │   │   └── Sidebar.jsx         # Navigation sidebar
│   │   └── Common/
│   │       ├── StatCard.jsx        # Reusable stat card
│   │       ├── LoadingSpinner.jsx  # Loading component
│   │       └── ErrorAlert.jsx      # Error display component
│   ├── pages/
│   │   ├── Dashboard.jsx           # Main dashboard with charts
│   │   ├── Marketing.jsx           # Campaign management
│   │   ├── Income.jsx              # Income transactions
│   │   ├── Expenses.jsx            # Expense transactions
│   │   ├── Invoices.jsx            # Invoice management
│   │   └── Reports.jsx             # Report generation
│   ├── services/
│   │   └── api.js                  # API service layer (axios)
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles (Tailwind)
├── index.html
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── package.json
```

## 🎨 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Material-UI (MUI)** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library
- **Axios** - HTTP client
- **date-fns** - Date formatting

## 🔧 Key Features Explained

### Dashboard
- Real-time financial metrics (income, expenses, profit)
- Interactive charts showing trends
- Campaign performance overview
- Quick stats for current month

### Marketing
- Full CRUD operations for campaigns
- Platform-based filtering
- Lead and conversion tracking
- ROI calculations

### Income & Expenses
- Categorized transactions
- Date-based filtering
- Summary statistics
- Easy add/edit/delete

### Invoices
- Professional invoice creation
- Line item management
- Automatic calculations (subtotal, tax, total)
- Status tracking (paid, pending, overdue)
- Mark as paid functionality

### Reports
- Financial statement reports
- Marketing performance reports
- Invoice reports
- Comprehensive business reports
- CSV export functionality
- Date range filtering

## 🎨 Styling

The app uses a combination of:
- **Material-UI** for components and consistent design system
- **Tailwind CSS** for utility classes and layout (configured to not conflict with MUI)
- **Custom theme** defined in App.jsx with primary colors and typography

## 📱 Responsive Design

The application is fully responsive:
- Mobile-first design approach
- Collapsible sidebar on mobile devices
- Responsive tables and cards
- Touch-friendly UI elements

## 🔌 API Integration

All API calls are centralized in `src/services/api.js`:
- Axios instance with base configuration
- Request/response interceptors for logging
- Organized by feature (campaigns, transactions, invoices, dashboard, reports)

Example usage:
```javascript
import { campaignAPI } from './services/api';

// Get all campaigns
const response = await campaignAPI.getAll();

// Create new campaign
await campaignAPI.create(campaignData);
```

## 🚀 Development Tips

1. **Hot Module Replacement (HMR)**: Changes are reflected instantly in development
2. **Component Organization**: Keep components small and focused
3. **State Management**: Uses React hooks (useState, useEffect) - no Redux needed
4. **Error Handling**: All API calls include try-catch with user-friendly error messages

## 📦 Building for Production

```bash
npm run build
```

This will:
- Bundle and minify the application
- Optimize assets
- Generate production-ready files in `dist/` folder

Serve the `dist` folder with any static file server:
```bash
npm run preview  # Preview production build locally
```

## 🔍 Common Issues

### Port Already in Use
If port 3000 is already in use, Vite will automatically try the next available port.

### API Connection Issues
Make sure:
1. Backend server is running on port 5000
2. Check console for CORS errors
3. Verify API endpoint configuration in `vite.config.js`

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

## 🤝 Contributing

This is a demo project. Feel free to:
- Add new features
- Improve UI/UX
- Add more chart types
- Implement PDF export with jsPDF
- Add authentication
- Add data caching

## 📄 License

MIT


