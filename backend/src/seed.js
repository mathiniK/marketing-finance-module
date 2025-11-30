require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Campaign = require('./models/Campaign');
const Transaction = require('./models/Transaction');
const Invoice = require('./models/Invoice');

/**
 * Seed Script - Populates the database with sample data
 * Run with: npm run seed
 */

const campaigns = [
  {
    name: 'Summer Sale Facebook Campaign',
    platform: 'Facebook',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-30'),
    budget: 5000,
    leadsGenerated: 250,
    conversions: 45,
    status: 'completed',
  },
  {
    name: 'Google Ads - Product Launch',
    platform: 'Google',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-07-31'),
    budget: 8000,
    leadsGenerated: 320,
    conversions: 68,
    status: 'completed',
  },
  {
    name: 'Email Marketing - Newsletter',
    platform: 'Email',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-08-31'),
    budget: 1500,
    leadsGenerated: 180,
    conversions: 52,
    status: 'completed',
  },
  {
    name: 'Facebook Lead Generation Campaign',
    platform: 'Facebook',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-09-30'),
    budget: 6000,
    leadsGenerated: 145,
    conversions: 38,
    status: 'completed',
  },
  {
    name: 'Google Search Ads - Brand Awareness',
    platform: 'Google',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-12-31'),
    budget: 4500,
    leadsGenerated: 200,
    conversions: 35,
    status: 'active',
  },
  {
    name: 'Email - Holiday Promotion',
    platform: 'Email',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-12-31'),
    budget: 2000,
    leadsGenerated: 320,
    conversions: 85,
    status: 'active',
  },
];

const transactions = [
  // Income transactions
  {
    type: 'income',
    category: 'project',
    amount: 25000,
    date: new Date('2025-01-15'),
    description: 'Web Development Project - ABC Corp',
    notes: 'Full stack application development',
  },
  {
    type: 'income',
    category: 'project',
    amount: 18000,
    date: new Date('2025-02-20'),
    description: 'Mobile App Development - XYZ Inc',
    notes: 'iOS and Android app',
  },
  {
    type: 'income',
    category: 'project',
    amount: 32000,
    date: new Date('2025-03-10'),
    description: 'Enterprise Software - TechCo',
    notes: 'Custom ERP solution',
  },
  {
    type: 'income',
    category: 'deposit',
    amount: 15000,
    date: new Date('2025-04-05'),
    description: 'Project Deposit - NewClient Ltd',
    notes: '50% upfront payment',
  },
  {
    type: 'income',
    category: 'project',
    amount: 22000,
    date: new Date('2025-05-18'),
    description: 'UI/UX Design Project - DesignHub',
    notes: 'Complete redesign',
  },
  {
    type: 'income',
    category: 'project',
    amount: 28000,
    date: new Date('2025-06-22'),
    description: 'API Integration - CloudSystems',
    notes: 'Third-party API integration',
  },
  {
    type: 'income',
    category: 'other',
    amount: 5000,
    date: new Date('2025-07-30'),
    description: 'Consulting Services - StartupX',
    notes: 'Technical consultation',
  },
  {
    type: 'income',
    category: 'project',
    amount: 35000,
    date: new Date('2025-08-15'),
    description: 'E-commerce Platform - ShopNow',
    notes: 'Complete e-commerce solution',
  },
  {
    type: 'income',
    category: 'project',
    amount: 29000,
    date: new Date('2025-09-20'),
    description: 'Data Analytics Dashboard - DataCorp',
    notes: 'Real-time analytics platform',
  },
  {
    type: 'income',
    category: 'project',
    amount: 31000,
    date: new Date('2025-10-25'),
    description: 'SaaS Platform Development - CloudApp',
    notes: 'Multi-tenant SaaS solution',
  },
  // Expense transactions
  {
    type: 'expense',
    category: 'salary',
    amount: 45000,
    date: new Date('2025-01-31'),
    description: 'Employee Salaries - January',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 45000,
    date: new Date('2025-02-28'),
    description: 'Employee Salaries - February',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 45000,
    date: new Date('2025-03-31'),
    description: 'Employee Salaries - March',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 48000,
    date: new Date('2025-04-30'),
    description: 'Employee Salaries - April',
    notes: 'Monthly payroll + bonuses',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 45000,
    date: new Date('2025-05-31'),
    description: 'Employee Salaries - May',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 45000,
    date: new Date('2025-06-30'),
    description: 'Employee Salaries - June',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 45000,
    date: new Date('2025-07-31'),
    description: 'Employee Salaries - July',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 47000,
    date: new Date('2025-08-31'),
    description: 'Employee Salaries - August',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 45000,
    date: new Date('2025-09-30'),
    description: 'Employee Salaries - September',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'salary',
    amount: 45000,
    date: new Date('2025-10-31'),
    description: 'Employee Salaries - October',
    notes: 'Monthly payroll',
  },
  {
    type: 'expense',
    category: 'subscription',
    amount: 2500,
    date: new Date('2025-01-05'),
    description: 'AWS Cloud Services - Annual',
    notes: 'Cloud hosting and services',
  },
  {
    type: 'expense',
    category: 'subscription',
    amount: 599,
    date: new Date('2025-03-10'),
    description: 'GitHub Enterprise - Annual',
    notes: 'Version control',
  },
  {
    type: 'expense',
    category: 'subscription',
    amount: 199,
    date: new Date('2025-05-15'),
    description: 'Adobe Creative Cloud - Monthly',
    notes: 'Design tools',
  },
  {
    type: 'expense',
    category: 'subscription',
    amount: 299,
    date: new Date('2025-07-20'),
    description: 'Jira & Confluence - Monthly',
    notes: 'Project management tools',
  },
  {
    type: 'expense',
    category: 'marketing',
    amount: 5000,
    date: new Date('2025-06-15'),
    description: 'Facebook Ads Campaign',
    notes: 'Summer sale campaign',
  },
  {
    type: 'expense',
    category: 'marketing',
    amount: 8000,
    date: new Date('2025-07-20'),
    description: 'Google Ads - Product Launch',
    notes: 'New product marketing',
  },
  {
    type: 'expense',
    category: 'marketing',
    amount: 1500,
    date: new Date('2025-08-10'),
    description: 'Email Marketing Platform',
    notes: 'Newsletter campaign',
  },
  {
    type: 'expense',
    category: 'utilities',
    amount: 1200,
    date: new Date('2025-02-10'),
    description: 'Office Rent - February',
    notes: 'Monthly rent',
  },
  {
    type: 'expense',
    category: 'utilities',
    amount: 350,
    date: new Date('2025-03-15'),
    description: 'Internet & Phone Services',
    notes: 'Business communication',
  },
  {
    type: 'expense',
    category: 'utilities',
    amount: 280,
    date: new Date('2025-04-20'),
    description: 'Electricity & Water',
    notes: 'Office utilities',
  },
  {
    type: 'expense',
    category: 'other',
    amount: 3500,
    date: new Date('2025-05-25'),
    description: 'Office Equipment',
    notes: 'New laptops and monitors',
  },
  {
    type: 'expense',
    category: 'other',
    amount: 850,
    date: new Date('2025-09-10'),
    description: 'Team Building Event',
    notes: 'Quarterly team outing',
  },
];

const invoices = [
  {
    invoiceNumber: 'INV-0001',
    clientName: 'ABC Corporation',
    clientEmail: 'billing@abccorp.com',
    clientAddress: '123 Business St, New York, NY 10001',
    items: [
      {
        description: 'Web Application Development',
        quantity: 1,
        price: 20000,
        total: 20000,
      },
      {
        description: 'UI/UX Design Services',
        quantity: 1,
        price: 5000,
        total: 5000,
      },
    ],
    subtotal: 25000,
    taxRate: 10,
    tax: 2500,
    total: 27500,
    issueDate: new Date('2025-01-10'),
    dueDate: new Date('2025-01-25'),
    status: 'paid',
    paymentDate: new Date('2025-01-20'),
  },
  {
    invoiceNumber: 'INV-0002',
    clientName: 'XYZ Industries',
    clientEmail: 'accounts@xyzind.com',
    clientAddress: '456 Commerce Ave, Los Angeles, CA 90001',
    items: [
      {
        description: 'Mobile App Development (iOS & Android)',
        quantity: 1,
        price: 18000,
        total: 18000,
      },
    ],
    subtotal: 18000,
    taxRate: 10,
    tax: 1800,
    total: 19800,
    issueDate: new Date('2025-02-15'),
    dueDate: new Date('2025-03-01'),
    status: 'paid',
    paymentDate: new Date('2025-02-28'),
  },
  {
    invoiceNumber: 'INV-0003',
    clientName: 'TechStart Inc',
    clientEmail: 'finance@techstart.com',
    clientAddress: '789 Innovation Blvd, San Francisco, CA 94102',
    items: [
      {
        description: 'API Development & Integration',
        quantity: 1,
        price: 15000,
        total: 15000,
      },
      {
        description: 'Testing & Documentation',
        quantity: 1,
        price: 3000,
        total: 3000,
      },
    ],
    subtotal: 18000,
    taxRate: 10,
    tax: 1800,
    total: 19800,
    issueDate: new Date('2025-10-01'),
    dueDate: new Date('2025-10-31'),
    status: 'pending',
  },
  {
    invoiceNumber: 'INV-0004',
    clientName: 'Global Solutions Ltd',
    clientEmail: 'billing@globalsol.com',
    clientAddress: '321 Enterprise Dr, Chicago, IL 60601',
    items: [
      {
        description: 'Custom Software Development',
        quantity: 1,
        price: 32000,
        total: 32000,
      },
    ],
    subtotal: 32000,
    taxRate: 10,
    tax: 3200,
    total: 35200,
    issueDate: new Date('2025-09-15'),
    dueDate: new Date('2025-10-15'),
    status: 'overdue',
  },
  {
    invoiceNumber: 'INV-0005',
    clientName: 'Digital Ventures',
    clientEmail: 'payments@digitalvent.com',
    clientAddress: '555 Startup Lane, Austin, TX 78701',
    items: [
      {
        description: 'E-commerce Platform Development',
        quantity: 1,
        price: 28000,
        total: 28000,
      },
      {
        description: 'Payment Gateway Integration',
        quantity: 1,
        price: 5000,
        total: 5000,
      },
    ],
    subtotal: 33000,
    taxRate: 10,
    tax: 3300,
    total: 36300,
    issueDate: new Date('2025-10-20'),
    dueDate: new Date('2025-11-20'),
    status: 'pending',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Campaign.deleteMany({});
    await Transaction.deleteMany({});
    await Invoice.deleteMany({});

    // Insert new data
    console.log('📝 Inserting campaigns...');
    // Use create() instead of insertMany() to trigger pre-save hooks for ROI calculation
    const createdCampaigns = await Campaign.create(campaigns);
    
    // Log ROI values to verify calculation
    console.log('📊 Campaign ROI values:');
    createdCampaigns.forEach(campaign => {
      console.log(`   - ${campaign.name}: ${campaign.roi.toFixed(2)}%`);
    });

    console.log('📝 Inserting transactions...');
    await Transaction.insertMany(transactions);

    console.log('📝 Inserting invoices...');
    await Invoice.insertMany(invoices);

    console.log('✅ Database seeded successfully!');
    console.log(`   - ${campaigns.length} campaigns`);
    console.log(`   - ${transactions.length} transactions`);
    console.log(`   - ${invoices.length} invoices`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();


