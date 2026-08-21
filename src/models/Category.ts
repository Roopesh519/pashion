import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            unique: true,
            trim: true,
            maxlength: [60, 'Category name cannot be more than 60 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Please provide a category slug'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens only'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a category description'],
            trim: true,
            maxlength: [300, 'Description cannot be more than 300 characters'],
        },
        image: {
            type: String,
            required: [true, 'Please provide a category image'],
            trim: true,
        },
        featured: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
