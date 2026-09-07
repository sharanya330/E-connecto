import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google users
    googleId: { type: String },
    role: { type: String, enum: ['user', 'recycler', 'admin'], default: 'user' },
    ecoPoints: { type: Number, default: 0 },

    // Recycler-specific fields
    businessName: { type: String },
    contactPerson: { type: String },
    phone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pinCode: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    ewasteTypes: [{ type: String }],
    operatingHours: { type: String },
    certifications: { type: String },
    website: { type: String },
    businessLicense: { type: String },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
