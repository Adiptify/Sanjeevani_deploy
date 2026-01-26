import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Hospital from '@/models/Hospital';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        let hospitals = await Hospital.find({});

        // If empty, return a default list (or I could seed it)
        if (hospitals.length === 0) {
            hospitals = [
                { id: 'h1', name: 'Apollo Hospital', location: 'Jubilee Hills, Hyderabad', distance: '2.5 km', facilities: ['Emergency', 'ICU', 'Lab'] },
                { id: 'h2', name: 'Yashoda Hospital', location: 'Somajiguda, Hyderabad', distance: '4.1 km', facilities: ['Emergency', 'Surgery', 'Imaging'] }
            ];
        }


        return NextResponse.json(hospitals);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
    }
}
