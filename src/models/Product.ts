import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a product description'],
        trim: true,
        maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a product price'],
        min: [0, 'Price cannot be negative'],
    },
    images: {
        type: [String],
        required: [true, 'Please upload at least one image'],
        validate: {
            validator: (images: string[]) => Array.isArray(images) && images.length > 0 && images.every((image) => typeof image === 'string' && image.trim().length > 0),
            message: 'Please provide at least one valid image',
        },
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        index: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens only'],
    },
    sizes: {
        type: [String],
        default: ['S', 'M', 'L', 'XL'],
    },
    colors: [{
        name: String,
        value: String,
    }],
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative'],
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    badge: {
        type: String,
        default: '',
        maxlength: [30, 'Badge text cannot be more than 30 characters'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
