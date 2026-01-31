import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded: any = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await dbConnect();

        let query = {};
        if (decoded.role === 'Patient') {
            query = { patientEmail: decoded.email };
        } else if (decoded.role === 'Doctor') {
            query = { doctorEmail: decoded.email };
        }


        const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });
        return NextResponse.json(appointments);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded: any = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await dbConnect();
        const body = await req.json();

        const appointment = await Appointment.create({
            ...body,
            patientEmail: decoded.email
        });

        // Notify Patient
        await Notification.create({
            userEmail: decoded.email,
            title: 'Appointment Scheduled',
            message: `Your appointment with ${body.doctorName} on ${body.date} at ${body.time} has been scheduled.`,
            type: 'appointment',
            link: '/dashboard/patient'
        });

        // Notify Doctor
        const doctor = await User.findOne({
            email: body.doctorEmail,
            role: 'Doctor'
        });

        if (doctor) {
            await Notification.create({
                userEmail: doctor.email,
                title: 'New Appointment Request',
                message: `Patient ${decoded.email} has booked an appointment for ${body.date} at ${body.time}.`,
                type: 'appointment',
                link: '/dashboard/doctor'
            });
        }


        return NextResponse.json({ success: true, appointment });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to book appointment', details: error.message }, { status: 500 });
    }
}
