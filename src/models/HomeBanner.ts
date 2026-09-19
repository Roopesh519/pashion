import mongoose, { Schema } from 'mongoose';

const HomeBannerSchema = new Schema(
    {
        desktopImage: {
            type: String,
            required: [true, 'Please provide a desktop banner image'],
            trim: true,
        },
        mobileImage: {
            type: String,
            required: [true, 'Please provide a mobile banner image'],
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.HomeBanner || mongoose.model('HomeBanner', HomeBannerSchema);
