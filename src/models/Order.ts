import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Can be guest checkout for now
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
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            name: String,
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true },
            size: String,
            color: String,
            image: String,
        },
    ],
    
    // Pricing
    subtotal: Number,
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: {
        type: Number,
        required: true,
    },

    // Payment Info
    paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'stripe'], default: 'credit_card' },
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
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update updatedAt before saving
OrderSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
