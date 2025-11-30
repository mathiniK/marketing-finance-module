import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import ReportPDF from '../components/PDF/ReportPDF';
import { reportAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

/**
 * Reports Page
 * Generate and view financial, marketing, and invoice reports
 */
const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setReportData(null); // Clear previous report
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      switch (activeTab) {
        case 0: // Financial
          response = await reportAPI.getFinancial(filters);
          break;
        case 1: // Marketing
          response = await reportAPI.getMarketing(filters);
          break;
        case 2: // Invoices
          response = await reportAPI.getInvoices(filters);
          break;
        case 3: // Comprehensive
          response = await reportAPI.getComprehensive(filters);
          break;
        default:
          response = await reportAPI.getFinancial(filters);
      }

      setReportData(response.data.data);
    } catch (err) {
      setError(err);
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    switch (activeTab) {
      case 0: // Financial
        csvContent = 'Date,Type,Category,Description,Amount\n';
        reportData.transactions?.forEach(t => {
          csvContent += `${format(new Date(t.date), 'yyyy-MM-dd')},${t.type},${t.category},"${t.description}",${t.amount}\n`;
        });
        filename = 'financial-report.csv';
        break;
      case 1: // Marketing
        csvContent = 'Campaign,Platform,Start Date,End Date,Budget,Leads,Conversions,Cost per Lead\n';
        reportData.campaigns?.forEach(c => {
          csvContent += `"${c.name}",${c.platform},${format(new Date(c.startDate), 'yyyy-MM-dd')},${format(new Date(c.endDate), 'yyyy-MM-dd')},${c.budget},${c.leadsGenerated},${c.conversions},${c.costPerLead}\n`;
        });
        filename = 'marketing-report.csv';
        break;
      case 2: // Invoices
        csvContent = 'Invoice Number,Client,Issue Date,Due Date,Amount,Status\n';
        reportData.invoices?.forEach(i => {
          csvContent += `${i.invoiceNumber},"${i.clientName}",${format(new Date(i.issueDate), 'yyyy-MM-dd')},${format(new Date(i.dueDate), 'yyyy-MM-dd')},${i.total},${i.status}\n`;
        });
        filename = 'invoice-report.csv';
        break;
      case 3: // Comprehensive
        // Export all data combined
        csvContent = '=== FINANCIAL DATA ===\n';
        csvContent += 'Date,Type,Category,Description,Amount\n';
        reportData.financial?.transactions?.forEach(t => {
          csvContent += `${format(new Date(t.date), 'yyyy-MM-dd')},${t.type},${t.category},"${t.description}",${t.amount}\n`;
        });
        
        csvContent += '\n=== MARKETING DATA ===\n';
        csvContent += 'Campaign,Platform,Start Date,End Date,Budget,Leads,Conversions,Cost per Lead\n';
        reportData.marketing?.campaigns?.forEach(c => {
          csvContent += `"${c.name}",${c.platform},${format(new Date(c.startDate), 'yyyy-MM-dd')},${format(new Date(c.endDate), 'yyyy-MM-dd')},${c.budget},${c.leadsGenerated},${c.conversions},${c.costPerLead}\n`;
        });
        
        csvContent += '\n=== INVOICE DATA ===\n';
        csvContent += 'Invoice Number,Client,Issue Date,Due Date,Amount,Status\n';
        reportData.invoices?.invoices?.forEach(i => {
          csvContent += `${i.invoiceNumber},"${i.clientName}",${format(new Date(i.issueDate), 'yyyy-MM-dd')},${format(new Date(i.dueDate), 'yyyy-MM-dd')},${i.total},${i.status}\n`;
        });
        
        filename = 'comprehensive-report.csv';
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getReportType = () => {
    switch (activeTab) {
      case 0:
        return 'financial';
      case 1:
        return 'marketing';
      case 2:
        return 'invoice';
      case 3:
        return 'comprehensive';
      default:
        return 'financial';
    }
  };

  const getPDFFileName = () => {
    const reportType = getReportType();
    const startDateStr = format(new Date(filters.startDate), 'yyyy-MM-dd');
    const endDateStr = format(new Date(filters.endDate), 'yyyy-MM-dd');
    return `${reportType}-report_${startDateStr}_to_${endDateStr}.pdf`;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Reports & Analytics
      </Typography>

      {/* Report Type Tabs */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Financial Report" />
          <Tab label="Marketing Report" />
          <Tab label="Invoice Report" />
          <Tab label="Comprehensive" />
        </Tabs>

        <CardContent>
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  format="dd-MM-yyyy"
                  value={filters.startDate ? parseISO(filters.startDate) : null}
                  onChange={(newValue) => {
                    handleFilterChange({
                      target: {
                        name: 'startDate',
                        value: newValue ? format(newValue, 'yyyy-MM-dd') : '',
                      },
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  format="dd-MM-yyyy"
                  value={filters.endDate ? parseISO(filters.endDate) : null}
                  onChange={(newValue) => {
                    handleFilterChange({
                      target: {
                        name: 'endDate',
                        value: newValue ? format(newValue, 'yyyy-MM-dd') : '',
                      },
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateReport}
                sx={{ height: '56px', bgcolor: '#4fc3f7', '&:hover': { bgcolor: '#29b6f6' } }}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>

          {/* Export Buttons */}
          {reportData && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ExcelIcon />}
                onClick={handleExportCSV}
                color="success"
                fullWidth={{ xs: true, sm: false }}
              >
                CSV
              </Button>
              <PDFDownloadLink
                document={
                  <ReportPDF
                    reportData={reportData}
                    reportType={getReportType()}
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                  />
                }
                fileName={getPDFFileName()}
                style={{ textDecoration: 'none' }}
              >
                {({ loading }) => (
                  <Button
                    variant="outlined"
                    startIcon={<PdfIcon />}
                    color="error"
                    disabled={loading}
                    fullWidth={{ xs: true, sm: false }}
                  >
                    {loading ? 'Generating...' : 'PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Loading and Error States */}
      {loading && <LoadingSpinner message="Generating report..." />}
      {error && <ErrorAlert error={error} title="Failed to generate report" />}

      {/* Report Content */}
      {reportData && !loading && (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            {/* Financial Report */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Financial Statement
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Period: {format(new Date(reportData.period.start), 'dd-MM-yyyy')} - {format(new Date(reportData.period.end), 'dd-MM-yyyy')}
                </Typography>

                {/* Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                      <Typography variant="body2" color="text.secondary">Total Income</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {formatCurrency(reportData.summary.totalIncome)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                      <Typography variant="body2" color="text.secondary">Total Expense</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                        {formatCurrency(reportData.summary.totalExpense)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: reportData.summary.netProfit >= 0 ? '#e3f2fd' : '#ffebee' }}>
                      <Typography variant="body2" color="text.secondary">Net Profit</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: reportData.summary.netProfit >= 0 ? '#2196f3' : '#f44336' }}>
                        {formatCurrency(reportData.summary.netProfit)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Transactions Table */}
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.transactions?.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell>{format(new Date(transaction.date), 'dd-MM-yyyy')}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{transaction.type}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{transaction.category}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell align="right" sx={{ color: transaction.type === 'income' ? '#4caf50' : '#f44336', fontWeight: 600 }}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Marketing Report */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Marketing Performance Report
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Period: {format(new Date(reportData.period.start), 'dd-MM-yyyy')} - {format(new Date(reportData.period.end), 'dd-MM-yyyy')}
                </Typography>

                {/* Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Total Campaigns</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{reportData.summary.totalCampaigns}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Total Budget</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(reportData.summary.totalBudget)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Total Leads</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{reportData.summary.totalLeads}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{reportData.summary.conversionRate}%</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Campaigns Table */}
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Campaign</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Budget</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Leads</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Conversions</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Cost/Lead</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.campaigns?.map((campaign) => (
                        <TableRow key={campaign._id}>
                          <TableCell>{campaign.name}</TableCell>
                          <TableCell>{campaign.platform}</TableCell>
                          <TableCell>
                            {format(new Date(campaign.startDate), 'dd-MM-yyyy')} - {format(new Date(campaign.endDate), 'dd-MM-yyyy')}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(campaign.budget)}</TableCell>
                          <TableCell align="right">{campaign.leadsGenerated}</TableCell>
                          <TableCell align="right">{campaign.conversions}</TableCell>
                          <TableCell align="right">{formatCurrency(campaign.costPerLead, true)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Invoice Report */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Invoice Report
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Period: {format(new Date(reportData.period.start), 'dd-MM-yyyy')} - {format(new Date(reportData.period.end), 'dd-MM-yyyy')}
                </Typography>

                {/* Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>${reportData.summary.totalAmount?.toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                      <Typography variant="body2" color="text.secondary">Paid</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>${reportData.summary.paidAmount?.toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                      <Typography variant="body2" color="text.secondary">Pending</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>${reportData.summary.pendingAmount?.toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                      <Typography variant="body2" color="text.secondary">Overdue</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>${reportData.summary.overdueAmount?.toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Invoices Table */}
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.invoices?.map((invoice) => (
                        <TableRow key={invoice._id}>
                          <TableCell sx={{ fontWeight: 600 }}>{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell>{format(new Date(invoice.issueDate), 'dd-MM-yyyy')}</TableCell>
                          <TableCell>{format(new Date(invoice.dueDate), 'dd-MM-yyyy')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(invoice.total)}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{invoice.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Comprehensive Report */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Comprehensive Business Report
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Period: {format(new Date(reportData.period.start), 'MMM dd, yyyy')} - {format(new Date(reportData.period.end), 'MMM dd, yyyy')}
                </Typography>

                {/* Financial Summary */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Financial Overview</Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                      <Typography variant="body2">Income</Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50' }}>{formatCurrency(reportData.financial.totalIncome)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                      <Typography variant="body2">Expenses</Typography>
                      <Typography variant="h6" sx={{ color: '#f44336' }}>{formatCurrency(reportData.financial.totalExpense)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                      <Typography variant="body2">Net Profit</Typography>
                      <Typography variant="h6" sx={{ color: '#2196f3' }}>{formatCurrency(reportData.financial.netProfit)}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Marketing Summary */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Marketing Overview</Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2">Total Campaigns</Typography>
                      <Typography variant="h6">{reportData.marketing.totalCampaigns}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2">Total Campaigns (Count)</Typography>
                      <Typography variant="h6">{reportData.marketing.campaigns?.length || 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2">Total Invoices</Typography>
                      <Typography variant="h6">{reportData.invoices.totalInvoices}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                  For detailed information, please view individual reports above.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Reports;


