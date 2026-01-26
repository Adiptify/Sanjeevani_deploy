import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patientEmail: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorEmail: { type: String, required: true },

    type: { type: String, enum: ['physical', 'virtual'], required: true },
    hospitalName: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String },
    problemType: { type: String },
    status: { type: String, enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'], default: 'Scheduled' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
