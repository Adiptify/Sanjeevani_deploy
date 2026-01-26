import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    distance: { type: String },
    facilities: [String],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
