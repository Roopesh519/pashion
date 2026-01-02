import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [false, 'Password not required if using OAuth'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't include password by default in queries
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },

    // Contact & Address
    phone: {
        type: String,
        maxlength: [20, 'Phone cannot be more than 20 characters'],
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: { type: String, default: 'US' },
    },

    // Email Verification
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Wishlist
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],

    // User Preferences
    preferences: {
        newsletter: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true },
        theme: { type: String, default: 'light' },
    },

    // Tracking
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

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
UserSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
