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

        let extraData = {};
        if (user.role === 'Patient') {
            const health = await HealthData.findOne({ patientEmail: user.email });
            extraData = { health };
        }

        return NextResponse.json({
            user,
            profile,
            ...extraData
        });

    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
}
