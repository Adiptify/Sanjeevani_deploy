import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['appointment', 'system', 'health', 'community'], default: 'system' },
    read: { type: Boolean, default: false },
    link: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
