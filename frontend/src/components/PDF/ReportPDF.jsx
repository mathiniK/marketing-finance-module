import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2196f3',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    borderBottom: '1 solid #e0e0e0',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1 solid #e0e0e0',
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    fontWeight: 'bold',
    borderBottom: '2 solid #2196f3',
  },
  col1: {
    width: '20%',
  },
  col2: {
    width: '25%',
  },
  col3: {
    width: '15%',
  },
  col4: {
    width: '20%',
  },
  col5: {
    width: '20%',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #2196f3',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 9,
    borderTop: '1 solid #e0e0e0',
    paddingTop: 10,
  },
});

const formatCurrency = (amount) => {
  return `Rs. ${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const ReportPDF = ({ reportData, reportType, startDate, endDate }) => {
  const getReportTitle = () => {
    switch (reportType) {
      case 'financial':
        return 'Financial Report';
      case 'marketing':
        return 'Marketing Report';
      case 'invoice':
        return 'Invoice Report';
      case 'comprehensive':
        return 'Comprehensive Business Report';
      default:
        return 'Business Report';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getReportTitle()}</Text>
          <Text style={styles.subtitle}>
            Period: {format(new Date(startDate), 'dd-MM-yyyy')} - {format(new Date(endDate), 'dd-MM-yyyy')}
          </Text>
          <Text style={styles.subtitle}>
            Generated: {format(new Date(), 'dd-MM-yyyy HH:mm')}
          </Text>
        </View>

        {/* Financial Summary - Only for Financial/Comprehensive Reports */}
        {reportType !== 'marketing' && reportType !== 'invoice' && (reportData.summary || reportData.financial) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Summary</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Revenue:</Text>
                <Text style={[styles.summaryValue, { color: '#4caf50' }]}>
                  {formatCurrency(reportData.summary?.totalIncome || reportData.financial?.totalIncome || 0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Expenses:</Text>
                <Text style={[styles.summaryValue, { color: '#f44336' }]}>
                  {formatCurrency(reportData.summary?.totalExpense || reportData.financial?.totalExpense || 0)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Net Profit:</Text>
                <Text style={[styles.totalValue, { 
                  color: (reportData.summary?.netProfit || reportData.financial?.netProfit || 0) >= 0 ? '#4caf50' : '#f44336' 
                }]}>
                  {formatCurrency(reportData.summary?.netProfit || reportData.financial?.netProfit || 0)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Marketing Summary - Only for Marketing/Comprehensive Reports */}
        {(reportType === 'marketing' || reportType === 'comprehensive') && reportData.summary && reportData.summary.totalCampaigns !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marketing Performance Summary</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Campaigns:</Text>
                <Text style={styles.summaryValue}>{reportData.summary.totalCampaigns}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Budget:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(reportData.summary.totalBudget || 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Leads Generated:</Text>
                <Text style={[styles.summaryValue, { color: '#4caf50' }]}>{reportData.summary.totalLeads || 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Conversions:</Text>
                <Text style={[styles.summaryValue, { color: '#2196f3' }]}>{reportData.summary.totalConversions || 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Avg. Cost Per Lead:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(parseFloat(reportData.summary.avgCostPerLead || 0))}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Conversion Rate:</Text>
                <Text style={[styles.summaryValue, { color: '#4caf50' }]}>{reportData.summary.conversionRate || 0}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Campaign Table - For Marketing Reports */}
        {reportType === 'marketing' && reportData.campaigns && reportData.campaigns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campaign Details</Text>
            
            {/* Table Header */}
            <View style={styles.headerRow}>
              <Text style={styles.col2}>Campaign</Text>
              <Text style={styles.col3}>Platform</Text>
              <Text style={styles.col4}>Budget</Text>
              <Text style={styles.col3}>Leads</Text>
              <Text style={styles.col3}>Conv.</Text>
            </View>

            {/* Table Rows - Show first 15 */}
            {reportData.campaigns.slice(0, 15).map((campaign, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.col2}>
                  {campaign.name.substring(0, 20)}
                  {campaign.name.length > 20 ? '...' : ''}
                </Text>
                <Text style={styles.col3}>{campaign.platform}</Text>
                <Text style={styles.col4}>{formatCurrency(campaign.budget)}</Text>
                <Text style={styles.col3}>{campaign.leadsGenerated}</Text>
                <Text style={styles.col3}>{campaign.conversions}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Transactions - Only for Financial/Comprehensive Reports */}
        {(reportType === 'financial' || reportType === 'comprehensive') && 
         ((reportData.transactions && reportData.transactions.length > 0) || 
          (reportData.financial?.transactions && reportData.financial.transactions.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            
            {/* Table Header */}
            <View style={styles.headerRow}>
              <Text style={styles.col1}>Date</Text>
              <Text style={styles.col2}>Description</Text>
              <Text style={styles.col3}>Type</Text>
              <Text style={styles.col4}>Category</Text>
              <Text style={styles.col5}>Amount</Text>
            </View>

            {/* Table Rows - Show first 20 */}
            {(reportData.transactions || reportData.financial?.transactions || []).slice(0, 20).map((transaction, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.col1}>
                  {format(new Date(transaction.date), 'dd-MM-yyyy')}
                </Text>
                <Text style={styles.col2}>
                  {transaction.description.substring(0, 25)}
                  {transaction.description.length > 25 ? '...' : ''}
                </Text>
                <Text style={styles.col3}>{transaction.type}</Text>
                <Text style={styles.col4}>{transaction.category}</Text>
                <Text style={[styles.col5, { 
                  color: transaction.type === 'income' ? '#4caf50' : '#f44336' 
                }]}>
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Invoice Summary - Only for Invoice/Comprehensive Reports */}
        {(reportType === 'invoice' || reportType === 'comprehensive') && 
         (reportData.invoices || (reportData.invoices && reportData.invoices.invoices)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Summary</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Invoices:</Text>
                <Text style={styles.summaryValue}>
                  {reportData.totalInvoices || reportData.invoices?.totalInvoices || 
                   (Array.isArray(reportData.invoices) ? reportData.invoices.length : 
                   (reportData.invoices?.invoices ? reportData.invoices.invoices.length : 0))}
                </Text>
              </View>
              {reportData.totalAmount !== undefined && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(reportData.totalAmount)}</Text>
                </View>
              )}
              {reportData.paidAmount !== undefined && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Paid Amount:</Text>
                  <Text style={[styles.summaryValue, { color: '#4caf50' }]}>{formatCurrency(reportData.paidAmount)}</Text>
                </View>
              )}
              {reportData.pendingAmount !== undefined && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pending Amount:</Text>
                  <Text style={[styles.summaryValue, { color: '#ff9800' }]}>{formatCurrency(reportData.pendingAmount)}</Text>
                </View>
              )}
              {((Array.isArray(reportData.invoices) && reportData.invoices.length > 0) || 
                (reportData.invoices?.invoices && reportData.invoices.invoices.length > 0)) && (
                <View style={{ marginTop: 10 }}>
                  {(Array.isArray(reportData.invoices) ? reportData.invoices : reportData.invoices?.invoices || [])
                    .slice(0, 10).map((invoice, index) => (
                    <View key={index} style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>{invoice.invoiceNumber} - {invoice.clientName.substring(0, 20)}:</Text>
                      <Text style={[styles.summaryValue, { 
                        color: invoice.status === 'paid' ? '#4caf50' : invoice.status === 'overdue' ? '#f44336' : '#ff9800'
                      }]}>
                        {formatCurrency(invoice.total)} ({invoice.status})
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Marketing Summary - For Comprehensive Report */}
        {reportType === 'comprehensive' && reportData.marketing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marketing Summary</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Campaigns:</Text>
                <Text style={styles.summaryValue}>{reportData.marketing.totalCampaigns}</Text>
              </View>
              {reportData.marketing.campaigns && reportData.marketing.campaigns.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.summaryLabel, { marginBottom: 5 }]}>Top Campaigns:</Text>
                  {reportData.marketing.campaigns.slice(0, 5).map((campaign, index) => (
                    <View key={index} style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>{campaign.name.substring(0, 25)}:</Text>
                      <Text style={styles.summaryValue}>
                        {campaign.leadsGenerated} leads • {formatCurrency(campaign.budget)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Marketing & Finance Management System</Text>
          <Text>© {new Date().getFullYear()} LushWare - Confidential</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;

