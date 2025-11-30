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
  Chip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Autorenew as AutorenewIcon,
  PauseCircle as PauseCircleIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import StatCard from '../components/Common/StatCard';
import { campaignAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const PLATFORMS = ['Facebook', 'Google', 'Email'];
const STATUS_OPTIONS = ['active', 'completed', 'paused'];

/**
 * Custom tick component for clean, readable labels with wrapping
 */
const CustomXAxisTick = ({ x, y, payload }) => {
  const maxLength = 12;
  let displayText = payload.value;
  
  // Truncate if too long
  if (displayText.length > maxLength) {
    displayText = displayText.substring(0, maxLength) + '...';
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={10}
        textAnchor="end" 
        fill="#666" 
        fontSize={10}
        transform="rotate(-35)"
      >
        {displayText}
      </text>
    </g>
  );
};

/**
 * Marketing Page
 * Manage campaigns with create, edit, delete functionality
 */
const Marketing = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Facebook',
    startDate: '',
    endDate: '',
    budget: '',
    leadsGenerated: 0,
    conversions: 0,
    status: 'active',
  });

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getAll();
      setCampaigns(response.data.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await campaignAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleOpenDialog = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        platform: campaign.platform,
        startDate: format(new Date(campaign.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(campaign.endDate), 'yyyy-MM-dd'),
        budget: campaign.budget,
        leadsGenerated: campaign.leadsGenerated,
        conversions: campaign.conversions,
        status: campaign.status,
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        platform: 'Facebook',
        startDate: '',
        endDate: '',
        budget: '',
        leadsGenerated: 0,
        conversions: 0,
        status: 'active',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCampaign(null);
    setSubmitError('');
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
    
    if (!formData.name.trim()) {
      errors.name = 'Campaign name is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date must be after or equal to start date';
    }
    
    if (!formData.budget || formData.budget < 0) {
      errors.budget = 'Budget must be a positive number';
    }
    
    if (formData.leadsGenerated < 0) {
      errors.leadsGenerated = 'Leads cannot be negative';
    }
    
    if (formData.conversions < 0) {
      errors.conversions = 'Conversions cannot be negative';
    } else if (formData.conversions > formData.leadsGenerated) {
      errors.conversions = 'Conversions cannot exceed leads generated';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitError('');
      if (editingCampaign) {
        await campaignAPI.update(editingCampaign._id, formData);
      } else {
        await campaignAPI.create(formData);
      }
      await fetchCampaigns();
      await fetchStats();
      handleCloseDialog();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to save campaign');
    }
  };

  const handleDeleteClick = (campaign) => {
    setDeletingCampaign(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCampaign) return;

    setDeleting(true);
    try {
      await campaignAPI.delete(deletingCampaign._id);
      await fetchCampaigns();
      await fetchStats();
      setDeleteDialogOpen(false);
      setDeletingCampaign(null);
    } catch (err) {
      setError(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingCampaign(null);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: '#2196f3',
          bgColor: '#e3f2fd',
          icon: <AutorenewIcon sx={{ fontSize: 16 }} />,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: '#4caf50',
          bgColor: '#e8f5e9',
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        };
      case 'paused':
        return {
          label: 'Paused',
          color: '#ff9800',
          bgColor: '#fff3e0',
          icon: <PauseCircleIcon sx={{ fontSize: 16 }} />,
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

  if (loading) return <LoadingSpinner message="Loading campaigns..." />;
  if (error) return <ErrorAlert error={error} title="Failed to load campaigns" />;

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
          Marketing Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#4fc3f7', '&:hover': { bgcolor: '#29b6f6' }, width: { xs: '100%', sm: 'auto' } }}
        >
          New Campaign
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Campaigns"
              value={stats.totalCampaigns}
              color="#4fc3f7"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Budget"
              value={formatCurrency(stats.totalBudget || 0)}
              color="#f06292"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Leads"
              value={stats.totalLeads?.toLocaleString() || 0}
              color="#66bb6a"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Conversions"
              value={stats.totalConversions?.toLocaleString() || 0}
              color="#ffb74d"
            />
          </Grid>
        </Grid>
      )}

      {/* ROI & Performance Visualization */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Campaign ROI Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Campaign ROI & Conversion Rate
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={campaigns.map(c => ({
                    name: c.name,
                    displayName: c.name,
                    fullName: c.name,
                    roi: c.roi || 0,
                    conversionRate: c.conversionRate || 0,
                  }))}
                  margin={{ top: 40, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="displayName" 
                    height={100}
                    interval={0}
                    tick={<CustomXAxisTick />}
                  />
                  <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <Box sx={{ bgcolor: 'white', p: 1.5, border: '1px solid #ccc', borderRadius: 1, boxShadow: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
                              {payload[0].payload.fullName}
                            </Typography>
                            {payload.map((entry, index) => (
                              <Typography key={index} variant="body2" sx={{ color: entry.color, fontSize: '0.875rem' }}>
                                {entry.name}: {Number(entry.value).toFixed(1)}%
                              </Typography>
                            ))}
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="square"
                    wrapperStyle={{ paddingBottom: '20px' }} 
                  />
                  <Bar dataKey="roi" fill="#4fc3f7" name="ROI (%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversionRate" fill="#66bb6a" name="Conversion Rate (%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance by Platform */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Success Rate by Platform
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={stats?.leadsByPlatform?.map(p => ({
                    platform: p._id,
                    conversionRate: p.leads > 0 ? Number(((p.conversions / p.leads) * 100).toFixed(1)) : 0,
                  })) || []}
                  margin={{ top: 40, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="platform" 
                    stroke="#666"
                    tick={{ fontSize: 11 }}
                    height={100}
                  />
                  <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <Box sx={{ bgcolor: 'white', p: 1.5, border: '1px solid #ccc', borderRadius: 1, boxShadow: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
                              {payload[0].payload.platform}
                            </Typography>
                            {payload.map((entry, index) => (
                              <Typography key={index} variant="body2" sx={{ color: entry.color, fontSize: '0.875rem' }}>
                                {entry.name}: {Number(entry.value).toFixed(1)}%
                              </Typography>
                            ))}
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="square"
                    wrapperStyle={{ paddingBottom: '20px' }} 
                  />
                  <Bar dataKey="conversionRate" fill="#f06292" name="Conversion Rate (%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Campaigns Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Monthly Campaign Activity
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={stats?.monthlyCampaigns?.map(m => ({
                    month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
                    campaigns: m.count,
                    leads: m.leads,
                    budget: m.budget / 1000, // Convert to thousands for better scale
                  })) || []}
                  margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    tick={{ fontSize: 11 }}
                    height={60}
                  />
                  <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <Box sx={{ bgcolor: 'white', p: 1.5, border: '1px solid #ccc', borderRadius: 1, boxShadow: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
                              {payload[0].payload.month}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4fc3f7', fontSize: '0.875rem' }}>
                              Campaigns: {payload[0].payload.campaigns}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#66bb6a', fontSize: '0.875rem' }}>
                              Leads: {payload[0].payload.leads?.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffb74d', fontSize: '0.875rem' }}>
                              Budget: ${(payload[0].payload.budget * 1000).toLocaleString()}
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="square"
                    wrapperStyle={{ paddingBottom: '20px' }} 
                  />
                  <Bar dataKey="campaigns" fill="#4fc3f7" name="Campaigns" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leads" fill="#66bb6a" name="Leads Generated" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="budget" fill="#ffb74d" name="Budget (K$)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaigns Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Campaign Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Platform</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Budget</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Leads</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Conversions</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Cost/Lead</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>ROI</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No campaigns found. Create your first campaign!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign._id} hover>
                      <TableCell>{campaign.name}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{campaign.platform}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                        {format(new Date(campaign.startDate), 'dd-MM-yyyy')} - {format(new Date(campaign.endDate), 'dd-MM-yyyy')}
                      </TableCell>
                      <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{campaign.leadsGenerated?.toLocaleString()}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{campaign.conversions?.toLocaleString()}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{formatCurrency(campaign.costPerLead, true)}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: campaign.roi >= 0 ? '#4caf50' : '#f44336',
                            fontWeight: 600 
                          }}
                        >
                          {campaign.roi?.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusConfig(campaign.status).icon}
                          label={getStatusConfig(campaign.status).label}
                          size="small"
                          sx={{
                            bgcolor: getStatusConfig(campaign.status).bgColor,
                            color: getStatusConfig(campaign.status).color,
                            fontWeight: 600,
                            borderRadius: '6px',
                            minWidth: '110px',
                            justifyContent: 'flex-start',
                            '& .MuiChip-icon': {
                              color: getStatusConfig(campaign.status).color,
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
                          onClick={() => handleOpenDialog(campaign)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(campaign)}
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
        <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
        <DialogContent>
          {submitError && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
              <Typography variant="body2" color="error">
                {submitError}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Campaign Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              label="Platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              select
              fullWidth
              required
            >
              {PLATFORMS.map((platform) => (
                <MenuItem key={platform} value={platform}>
                  {platform}
                </MenuItem>
              ))}
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                format="dd-MM-yyyy"
                value={formData.startDate ? parseISO(formData.startDate) : null}
                onChange={(newValue) => {
                  handleInputChange({
                    target: {
                      name: 'startDate',
                      value: newValue ? format(newValue, 'yyyy-MM-dd') : '',
                    },
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.startDate,
                    helperText: formErrors.startDate,
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                format="dd-MM-yyyy"
                value={formData.endDate ? parseISO(formData.endDate) : null}
                onChange={(newValue) => {
                  handleInputChange({
                    target: {
                      name: 'endDate',
                      value: newValue ? format(newValue, 'yyyy-MM-dd') : '',
                    },
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.endDate,
                    helperText: formErrors.endDate,
                  },
                }}
              />
            </LocalizationProvider>
            <TextField
              label="Budget"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              error={!!formErrors.budget}
              helperText={formErrors.budget}
            />
            <TextField
              label="Leads Generated"
              name="leadsGenerated"
              type="number"
              value={formData.leadsGenerated}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ min: 0 }}
              error={!!formErrors.leadsGenerated}
              helperText={formErrors.leadsGenerated}
            />
            <TextField
              label="Conversions"
              name="conversions"
              type="number"
              value={formData.conversions}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ min: 0 }}
              error={!!formErrors.conversions}
              helperText={formErrors.conversions}
            />
            <TextField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              select
              fullWidth
            >
              {STATUS_OPTIONS.map((status) => {
                const config = getStatusConfig(status);
                return (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {config.icon}
                      <Typography>{config.label}</Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingCampaign ? 'Update' : 'Create'}
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
          Delete Campaign
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this campaign?
          </Typography>
          {deletingCampaign && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {deletingCampaign.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {deletingCampaign.platform} • {deletingCampaign.status}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Budget: {formatCurrency(deletingCampaign.budget)}
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

export default Marketing;


