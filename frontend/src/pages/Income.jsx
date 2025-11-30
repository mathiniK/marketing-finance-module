import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import StatCard from '../components/Common/StatCard';
import { transactionAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const INCOME_CATEGORIES = ['project', 'invoice', 'deposit', 'other'];

/**
 * Income Page
 * Manage income transactions
 */
const Income = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    category: 'project',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    notes: '',
  });

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll({ type: 'income' });
      setTransactions(response.data.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await transactionAPI.getIncomeSummary();
      setSummary(response.data.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        category: transaction.category,
        amount: transaction.amount,
        date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        description: transaction.description,
        notes: transaction.notes || '',
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        category: 'project',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length > 200) {
      errors.description = 'Description cannot exceed 200 characters';
    }
    
    if (formData.notes && formData.notes.length > 250) {
      errors.notes = 'Notes cannot exceed 250 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const data = { ...formData, type: 'income' };
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction._id, data);
      } else {
        await transactionAPI.create(data);
      }
      await fetchTransactions();
      await fetchSummary();
      handleCloseDialog();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDeleteClick = (transaction) => {
    setDeletingTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;

    setDeleting(true);
    try {
      await transactionAPI.delete(deletingTransaction._id);
      await fetchTransactions();
      await fetchSummary();
      setDeleteDialogOpen(false);
      setDeletingTransaction(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingTransaction(null);
  };

  if (loading) return <LoadingSpinner message="Loading income data..." />;
  if (error) return <ErrorAlert error={error} title="Failed to load income data" />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Income Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, width: { xs: '100%', sm: 'auto' } }}
        >
          Add Income
        </Button>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Income"
              value={formatCurrency(summary.total || 0)}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Transactions"
              value={summary.count || 0}
              color="#4fc3f7"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Average Transaction"
              value={formatCurrency(summary.count > 0 ? (summary.total / summary.count) : 0)}
              color="#ffb74d"
            />
          </Grid>
        </Grid>
      )}

      {/* Transactions Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Notes</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No income transactions found. Add your first entry!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id} hover>
                      <TableCell>{format(new Date(transaction.date), 'dd-MM-yyyy')}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{transaction.category}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell sx={{ color: '#4caf50', fontWeight: 600 }}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{transaction.notes || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(transaction)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(transaction)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTransaction ? 'Edit Income' : 'Add Income'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              select
              fullWidth
              required
            >
              {INCOME_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ min: 0.01, step: 0.01 }}
              error={!!formErrors.amount}
              helperText={formErrors.amount}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                format="dd-MM-yyyy"
                value={formData.date ? parseISO(formData.date) : null}
                onChange={(newValue) => {
                  handleInputChange({
                    target: {
                      name: 'date',
                      value: newValue ? format(newValue, 'yyyy-MM-dd') : '',
                    },
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.date,
                    helperText: formErrors.date,
                  },
                }}
              />
            </LocalizationProvider>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              required
              multiline
              rows={2}
              inputProps={{ maxLength: 200 }}
              error={!!formErrors.description}
              helperText={formErrors.description || `${formData.description.length}/200`}
            />
            <TextField
              label="Notes (optional)"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              inputProps={{ maxLength: 250 }}
              error={!!formErrors.notes}
              helperText={formErrors.notes || `${formData.notes.length}/250`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="success">
            {editingTransaction ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete Income Transaction
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this income transaction?
          </Typography>
          {deletingTransaction && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                {formatCurrency(deletingTransaction.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {deletingTransaction.description}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {deletingTransaction.category} • {format(new Date(deletingTransaction.date), 'dd-MM-yyyy')}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Income;


