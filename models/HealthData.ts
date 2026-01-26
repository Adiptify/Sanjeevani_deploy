import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema({
    patientEmail: { type: String, required: true, unique: true },
    physicalHealth: { type: Number, default: 75 },
    mentalHealth: { type: Number, default: 80 },
    overallWellness: { type: Number, default: 77 },
    history: [{
        date: { type: Date, default: Date.now },
        physicalHealth: Number,
        mentalHealth: Number,
        overallWellness: Number
    }],
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.models.HealthData || mongoose.model('HealthData', healthDataSchema);
