import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import HealthData from '@/models/HealthData';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const totalPatients = await User.countDocuments({ role: 'Patient' });

        // Generate simulated weekly trends
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
        const trends = weeks.map((week, idx) => ({
            week,
            patientGrowth: Math.floor(totalPatients * (0.8 + (idx * 0.05))),
            avgWellness: 75 + Math.floor(Math.random() * 10),
            mentalHealthTrend: 70 + Math.floor(Math.random() * 15),
            sosAlerts: Math.floor(Math.random() * 5)
        }));

        // Geographic distribution simulation
        const regions = [
            { name: 'North', healthScore: 72, activeUsers: 450 },
            { name: 'South', healthScore: 81, activeUsers: 320 },
            { name: 'East', healthScore: 68, activeUsers: 210 },
            { name: 'West', healthScore: 79, activeUsers: 540 }
        ];

        return NextResponse.json({
            success: true,
            totalSystemUsers: totalPatients,
            trends,
            regions,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to generate simulation data' },
            { status: 500 }
        );
    }
}
