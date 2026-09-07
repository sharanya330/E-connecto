import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{ type: String, required: true }],
    weight: { type: String, required: true },
    location: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'completed', 'rejected'],
        default: 'pending'
    },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    notes: { type: String },
    recyclerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned recycler
    ecoPointsAwarded: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Pickup || mongoose.model('Pickup', pickupSchema);
