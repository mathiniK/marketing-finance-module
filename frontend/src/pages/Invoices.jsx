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
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import StatCard from '../components/Common/StatCard';
import { invoiceAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

/**
 * Invoices Page
 * Create, manage, and track invoices with payment status
 */
const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    taxRate: 10,
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll();
      setInvoices(response.data.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await invoiceAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleOpenDialog = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail || '',
        clientAddress: invoice.clientAddress || '',
        items: invoice.items,
        taxRate: invoice.taxRate,
        issueDate: format(new Date(invoice.issueDate), 'yyyy-MM-dd'),
        dueDate: format(new Date(invoice.dueDate), 'yyyy-MM-dd'),
        notes: invoice.notes || '',
      });
    } else {
      setEditingInvoice(null);
      setFormData({
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        items: [{ description: '', quantity: 1, price: 0 }],
        taxRate: 10,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingInvoice(null);
    setFormErrors({});
  };

  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewingInvoice(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
    // Clear item errors
    if (formErrors[`item_${index}`]) {
      setFormErrors(prev => ({ ...prev, [`item_${index}`]: '' }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.clientName.trim()) {
      errors.clientName = 'Client name is required';
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    }
    
    if (!formData.items || formData.items.length === 0) {
      errors.items = 'At least one item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.description.trim()) {
          errors[`item_${index}`] = 'Description is required';
        }
        if (!item.quantity || item.quantity < 1) {
          errors[`item_${index}`] = (errors[`item_${index}`] || '') + ' Quantity must be at least 1';
        }
        if (!item.price || item.price <= 0) {
          errors[`item_${index}`] = (errors[`item_${index}`] || '') + ' Price must be greater than zero';
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingInvoice) {
        await invoiceAPI.update(editingInvoice._id, formData);
      } else {
        await invoiceAPI.create(formData);
      }
      await fetchInvoices();
      await fetchStats();
      handleCloseDialog();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save invoice');
    }
  };

  const handleMarkAsPaidClick = (invoice) => {
    setPayingInvoice(invoice);
    setPayDialogOpen(true);
  };

  const handleMarkAsPaidConfirm = async () => {
    if (!payingInvoice) return;

    setPaying(true);
    try {
      await invoiceAPI.markAsPaid(payingInvoice._id, { paymentDate: new Date() });
      await fetchInvoices();
      await fetchStats();
      setPayDialogOpen(false);
      setPayingInvoice(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setPaying(false);
    }
  };

  const handleMarkAsPaidCancel = () => {
    setPayDialogOpen(false);
    setPayingInvoice(null);
  };

  const handleDeleteClick = (invoice) => {
    console.log('Delete clicked for invoice:', invoice._id);
    setDeletingInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('Delete confirm clicked, invoice:', deletingInvoice);
    if (!deletingInvoice) {
      console.error('No invoice selected for deletion');
      return;
    }

    setDeleting(true);
    try {
      console.log('Calling delete API for invoice ID:', deletingInvoice._id);
      const response = await invoiceAPI.delete(deletingInvoice._id);
      console.log('Delete response:', response);
      await fetchInvoices();
      await fetchStats();
      setDeleteDialogOpen(false);
      setDeletingInvoice(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete invoice');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingInvoice(null);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          color: '#4caf50',
          bgColor: '#e8f5e9',
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        };
      case 'pending':
        return {
          label: 'Pending',
          color: '#ff9800',
          bgColor: '#fff3e0',
          icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
        };
      case 'overdue':
        return {
          label: 'Overdue',
          color: '#f44336',
          bgColor: '#ffebee',
          icon: <ErrorIcon sx={{ fontSize: 16 }} />,
        };
      default:
        return {
          label: status,
          color: '#757575',
          bgColor: '#f5f5f5',
          icon: null,
        };
    }
  };

  if (loading) return <LoadingSpinner message="Loading invoices..." />;
  if (error) return <ErrorAlert error={error} title="Failed to load invoices" />;

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
          Invoice Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#4fc3f7', '&:hover': { bgcolor: '#29b6f6' }, width: { xs: '100%', sm: 'auto' } }}
        >
          Create Invoice
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Invoices"
              value={stats.totalInvoices}
              color="#4fc3f7"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Paid"
              value={stats.paidInvoices}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending"
              value={stats.pendingInvoices}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Overdue"
              value={stats.overdueInvoices}
              color="#f44336"
            />
          </Grid>
        </Grid>
      )}

      {/* Invoices Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Issue Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No invoices found. Create your first invoice!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{format(new Date(invoice.issueDate), 'dd-MM-yyyy')}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{format(new Date(invoice.dueDate), 'dd-MM-yyyy')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusConfig(invoice.status).icon}
                          label={getStatusConfig(invoice.status).label}
                          size="small"
                          sx={{
                            bgcolor: getStatusConfig(invoice.status).bgColor,
                            color: getStatusConfig(invoice.status).color,
                            fontWeight: 600,
                            borderRadius: '6px',
                            minWidth: '110px',
                            justifyContent: 'flex-start',
                            '& .MuiChip-icon': {
                              color: getStatusConfig(invoice.status).color,
                            },
                            '& .MuiChip-label': {
                              paddingLeft: '4px',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewInvoice(invoice)}
                          color="info"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        {invoice.status !== 'paid' && (
                          <IconButton
                            size="small"
                            onClick={() => handleMarkAsPaidClick(invoice)}
                            color="success"
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(invoice)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(invoice)}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Client Information</Typography>
            <TextField
              label="Client Name"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.clientName}
              helperText={formErrors.clientName}
            />
            <TextField
              label="Client Email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Client Address"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Invoice Items</Typography>
            {formErrors.items && (
              <Typography variant="body2" color="error">{formErrors.items}</Typography>
            )}
            {formData.items.map((item, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                    sx={{ width: 100 }}
                    required
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    label="Price"
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                    sx={{ width: 120 }}
                    required
                    inputProps={{ min: 0.01, step: 0.01 }}
                  />
                  <IconButton
                    onClick={() => handleRemoveItem(index)}
                    color="error"
                    disabled={formData.items.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                {formErrors[`item_${index}`] && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {formErrors[`item_${index}`]}
                  </Typography>
                )}
              </Box>
            ))}
            <Button onClick={handleAddItem} variant="outlined" size="small" sx={{ width: 'fit-content' }}>
              Add Item
            </Button>

            <Divider sx={{ my: 1 }} />

            <TextField
              label="Tax Rate (%)"
              name="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ min: 0, max: 100, step: 0.1 }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Issue Date"
                format="dd-MM-yyyy"
                value={formData.issueDate ? parseISO(formData.issueDate) : null}
                onChange={(newValue) => {
                  handleInputChange({
                    target: {
                      name: 'issueDate',
                      value: newValue ? format(newValue, 'yyyy-MM-dd') : '',
                    },
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                format="dd-MM-yyyy"
                value={formData.dueDate ? parseISO(formData.dueDate) : null}
                onChange={(newValue) => {
                  handleInputChange({
                    target: {
                      name: 'dueDate',
                      value: newValue ? format(newValue, 'yyyy-MM-dd') : '',
                    },
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.dueDate,
                    helperText: formErrors.dueDate,
                  },
                }}
              />
            </LocalizationProvider>
            <TextField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingInvoice ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          {viewingInvoice && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Invoice Number</Typography>
                  <Typography variant="h6">{viewingInvoice.invoiceNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    icon={getStatusConfig(viewingInvoice.status).icon}
                    label={getStatusConfig(viewingInvoice.status).label}
                    sx={{
                      bgcolor: getStatusConfig(viewingInvoice.status).bgColor,
                      color: getStatusConfig(viewingInvoice.status).color,
                      fontWeight: 600,
                      borderRadius: '6px',
                      minWidth: '110px',
                      justifyContent: 'flex-start',
                      '& .MuiChip-icon': {
                        color: getStatusConfig(viewingInvoice.status).color,
                      },
                      '& .MuiChip-label': {
                        paddingLeft: '4px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Client Name</Typography>
                  <Typography>{viewingInvoice.clientName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Client Email</Typography>
                  <Typography>{viewingInvoice.clientEmail || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Client Address</Typography>
                  <Typography>{viewingInvoice.clientAddress || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>Items</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewingInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Typography>Subtotal: {formatCurrency(viewingInvoice.subtotal)}</Typography>
                    <Typography>Tax ({viewingInvoice.taxRate}%): {formatCurrency(viewingInvoice.tax)}</Typography>
                    <Typography variant="h6">Total: {formatCurrency(viewingInvoice.total)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Issue Date</Typography>
                  <Typography>{format(new Date(viewingInvoice.issueDate), 'dd-MM-yyyy')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                  <Typography>{format(new Date(viewingInvoice.dueDate), 'dd-MM-yyyy')}</Typography>
                </Grid>
                {viewingInvoice.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                    <Typography>{viewingInvoice.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Mark as Paid Confirmation Dialog */}
      <Dialog 
        open={payDialogOpen} 
        onClose={handleMarkAsPaidCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Mark Invoice as Paid
        </DialogTitle>
        <DialogContent>
          <Typography>
            Confirm payment received for this invoice?
          </Typography>
          {payingInvoice && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {payingInvoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {payingInvoice.clientName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#4caf50', fontWeight: 600 }}>
                {formatCurrency(payingInvoice.total)}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will automatically create an income transaction.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMarkAsPaidCancel} disabled={paying}>
            Cancel
          </Button>
          <Button 
            onClick={handleMarkAsPaidConfirm} 
            variant="contained" 
            color="success"
            disabled={paying}
          >
            {paying ? 'Processing...' : 'Mark as Paid'}
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
          Delete Invoice
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this invoice?
          </Typography>
          {deletingInvoice && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {deletingInvoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {deletingInvoice.clientName}
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {formatCurrency(deletingInvoice.total)}
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

export default Invoices;


