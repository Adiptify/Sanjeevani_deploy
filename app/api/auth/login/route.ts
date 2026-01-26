import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken({ id: user._id, email: user.email, role: user.role });

        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });

        // Set cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Login failed', details: error.message }, { status: 500 });
    }
}
