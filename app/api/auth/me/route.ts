import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Submission from '@/models/Submission';
import HealthData from '@/models/HealthData';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded: any = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const profile = await Submission.findOne({ email: user.email });

        let extraData: any = {};

        // Dynamic Health Data Initialization for Patients
        if (user.role === 'Patient') {
            let health = await HealthData.findOne({ patientEmail: user.email });
            if (!health) {
                // Initialize default health data based on profile conditions
                const baseline = profile?.medicalConditions ? 65 : 85;
                health = await HealthData.create({
                    patientEmail: user.email,
                    physicalHealth: baseline,
                    mentalHealth: baseline + 5,
                    overallWellness: baseline + 2,
                    history: [{
                        physicalHealth: baseline,
                        mentalHealth: baseline + 5,
                        overallWellness: baseline + 2
                    }]
                });
            }
            extraData.health = health;
        }

        // Global Stats for Ecosystem Visibility (NGO and Doctor)
        if (user.role === 'Doctor' || user.role === 'NGO') {
            const [totalPatients, totalDoctors, totalNGOs] = await Promise.all([
                User.countDocuments({ role: 'Patient' }),
                User.countDocuments({ role: 'Doctor' }),
                User.countDocuments({ role: 'NGO' })
            ]);
            extraData.systemStats = {
                totalPatients,
                totalDoctors,
                totalNGOs,
                communityHealthScore: 78 // Aggregate this in a real simulation route
            };
        }

        return NextResponse.json({
            user,
            profile,
            ...extraData
        });

    } catch (error: any) {
        console.error('Error in /api/auth/me:', error);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
}
