import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded: any = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await dbConnect();
        const notifications = await Notification.find({ userEmail: decoded.email }).sort({ createdAt: -1 });

        return NextResponse.json(notifications);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded: any = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await dbConnect();
        const { notificationId } = await req.json();

        await Notification.updateOne(
            { _id: notificationId, userEmail: decoded.email },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    // Utility to create a notification from other APIs
    try {
        await dbConnect();
        const body = await req.json();
        const notification = await Notification.create(body);
        return NextResponse.json(notification);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
