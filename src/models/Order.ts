import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    customerInfo: {
        email: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: String,
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: String,
        zip: { type: String, required: true },
        country: { type: String, default: 'US' },
    },
    items: {
        type: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            size: String,
            color: String,
            image: String,
        },
        ],
        required: true,
        validate: {
            validator: (items: unknown[]) => Array.isArray(items) && items.length > 0,
            message: 'An order must contain at least one item',
        },
    },
    
    // Pricing
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },

    // Payment Info
    paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'stripe', 'razorpay'], default: 'credit_card' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paymentDate: Date,

    // Shipping & Tracking
    shippingMethod: { type: String, enum: ['standard', 'express', 'overnight'], default: 'standard' },
    trackingNumber: String,
    estimatedDelivery: Date,
    shippingDate: Date,

    // Order Status
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        index: true,
    },
    statusHistory: [
        {
            status: String,
            timestamp: { type: Date, default: Date.now },
            notes: String,
        },
    ],

    // Notes
    notes: String,
    adminNotes: String,

    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

OrderSchema.index({ status: 1, createdAt: -1 });

// Update updatedAt before saving
OrderSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
