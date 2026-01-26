import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Submission from '@/models/Submission';
import HealthData from '@/models/HealthData';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { email, password, role, ...profileData } = body;

        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            email,
            password: hashedPassword,
            role,
            name: profileData.firstName ? `${profileData.firstName} ${profileData.lastName}` : (profileData.fullName || profileData.organizationName)
        });

        // Also save the full profile to Submission model
        const submission = await Submission.create({
            email,
            role,
            ...profileData,
            status: 'approved' // Automatically approve for this demo
        });

        // If patient, initialize health data
        if (role === 'Patient') {
            await HealthData.create({
                patientEmail: email,
                physicalHealth: 70 + Math.floor(Math.random() * 20),
                mentalHealth: 70 + Math.floor(Math.random() * 20),
                overallWellness: 70 + Math.floor(Math.random() * 20),
                history: [{
                    date: new Date(),
                    physicalHealth: 75,
                    mentalHealth: 80,
                    overallWellness: 77
                }]
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            userId: user._id
        });

    } catch (error: any) {
        console.error('Signup Error:', error);
        let errorMessage = 'Registration failed';
        if (error.message.includes('topology') || error.message.includes('connect')) {
            errorMessage = 'Database connection failed. Please check your MONGODB_URI in .env';
        }
        return NextResponse.json({
            error: errorMessage,
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }

}
