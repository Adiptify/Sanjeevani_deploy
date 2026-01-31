import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import dbConnect from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const location = searchParams.get('location');

        let query: any = { role: 'Doctor' };
        if (location) {
            query.$or = [
                { clinicAddress: { $regex: location, $options: 'i' } },
                { city: { $regex: location, $options: 'i' } }
            ];
        }

        const doctors = await Submission.find(query).select('fullName email specialization licenseNumber yearsOfExperience clinicAddress consultationFee availableDays city avatar signatureBase64');

        return NextResponse.json(doctors);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
    }
}
