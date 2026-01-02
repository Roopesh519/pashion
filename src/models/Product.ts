import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a product description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a product price'],
    },
    images: {
        type: [String],
        required: [true, 'Please upload at least one image'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        index: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
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
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
