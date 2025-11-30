import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Marketing from './pages/Marketing';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';

/**
 * Custom MUI theme configuration
 * Defines colors, typography, and other theme settings
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#4fc3f7',
      dark: '#29b6f6',
    },
    secondary: {
      main: '#f06292',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

/**
 * Main App Component
 * Sets up routing and theme provider
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;


