import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon from '@mui/icons-material/Paid';
import StatCard from '../components/Common/StatCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import { dashboardAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const COLORS = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

/**
 * Financial Dashboard
 * Shows revenue, expenses, profit/loss, and financial trends
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch financial summary
      const financialRes = await dashboardAPI.getFinancialSummary();
      setFinancialSummary(financialRes.data.data);
    } catch (err) {
      setError(err);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorAlert error={error} title="Failed to load dashboard" />;
  if (!financialSummary) return null;

  // Format monthly trend data for chart
  const monthlyTrendData = financialSummary?.monthlyTrend?.reduce((acc, item) => {
    const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    const existing = acc.find(d => d.month === monthKey);
    
    if (existing) {
      if (item._id.type === 'income') {
        existing.income = item.total;
      } else {
        existing.expense = item.total;
      }
    } else {
      acc.push({
        month: monthKey,
        income: item._id.type === 'income' ? item.total : 0,
        expense: item._id.type === 'expense' ? item.total : 0,
      });
    }
    return acc;
  }, []) || [];

  // Sort by month
  monthlyTrendData.sort((a, b) => a.month.localeCompare(b.month));

  // Format expense by category for pie chart
  const expenseByCategory = financialSummary?.expenseByCategory?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.total,
  })) || [];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Financial Dashboard
      </Typography>

      {/* Key Financial Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(financialSummary.totalIncome || 0)}
            icon={<TrendingUpIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Expenses"
            value={formatCurrency(financialSummary.totalExpense || 0)}
            icon={<TrendingDownIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Profit"
            value={formatCurrency(financialSummary.profit || 0)}
            icon={<AccountBalanceWalletIcon />}
            color={financialSummary.profit >= 0 ? '#4caf50' : '#f44336'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Profit Margin"
            value={`${financialSummary.profitMargin || 0}%`}
            icon={<PaidIcon />}
            color={financialSummary.profit >= 0 ? '#2196f3' : '#f44336'}
          />
        </Grid>
      </Grid>

      {/* Financial Charts */}
      <Grid container spacing={3}>
        {/* Income vs Expense Trend */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Monthly Profit/Loss Trend
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    wrapperStyle={{ paddingBottom: '10px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#4caf50" 
                    strokeWidth={3} 
                    name="Revenue" 
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#f44336" 
                    strokeWidth={3} 
                    name="Expenses" 
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Expense Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;


