const mongoose = require('mongoose');

/**
 * Invoice Schema for Invoice Management
 * Tracks invoices with line items and payment status
 */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // Allows null/undefined but enforces uniqueness when present
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
    },
    clientAddress: {
      type: String,
      trim: true,
    },
    // Line items for the invoice
    items: {
      type: [
        {
          description: {
            type: String,
            required: [true, 'Item description is required'],
            trim: true,
          },
          quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
          },
          price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0.01, 'Price must be greater than zero'],
          },
          total: {
            type: Number,
            default: 0,
          },
        },
      ],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Invoice must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculate subtotal, tax, and total before saving
 */
invoiceSchema.pre('save', function (next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => {
    item.total = item.quantity * item.price;
    return sum + item.total;
  }, 0);

  // Calculate tax
  this.tax = (this.subtotal * this.taxRate) / 100;

  // Calculate total
  this.total = this.subtotal + this.tax;

  // Auto-update status based on payment and due date
  if (this.status !== 'paid' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }

  next();
});

/**
 * Virtual field for number of days until/past due
 */
invoiceSchema.virtual('daysUntilDue').get(function () {
  const today = new Date();
  const diffTime = this.dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

/**
 * Static method to generate next invoice number
 */
invoiceSchema.statics.generateInvoiceNumber = async function () {
  // Get all invoices and find the highest invoice number
  const invoices = await this.find({}, { invoiceNumber: 1 }).lean();
  
  if (!invoices || invoices.length === 0) {
    return 'INV-0001';
  }

  // Extract numeric parts and find the maximum
  const numbers = invoices
    .map(inv => {
      if (inv.invoiceNumber && inv.invoiceNumber.startsWith('INV-')) {
        return parseInt(inv.invoiceNumber.split('-')[1]);
      }
      return 0;
    })
    .filter(num => !isNaN(num));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
  return `INV-${nextNumber}`;
};

// Ensure virtual fields are included when converting to JSON
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Invoice', invoiceSchema);


