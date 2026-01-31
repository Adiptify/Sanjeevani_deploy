import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import OpenAI from "openai";
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Submission from '@/models/Submission';
import HealthData from '@/models/HealthData';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, message } = body;

        const token = req.cookies.get('token')?.value;
        let userContext = "You are Sanjeevni AI, a professional and empathetic healthcare assistant.";

        if (token) {
            try {
                const decoded: any = verifyToken(token);
                if (decoded) {
                    await dbConnect();
                    const [user, profile, health] = await Promise.all([
                        User.findById(decoded.id),
                        Submission.findOne({ email: decoded.email }),
                        HealthData.findOne({ patientEmail: decoded.email })
                    ]);

                    if (user) {
                        userContext += `\n\nUSER PROFILE:\nName: ${user.name}\nRole: ${user.role}`;
                        if (profile?.medicalConditions) {
                            userContext += `\nExisting Medical Conditions: ${profile.medicalConditions}`;
                        }
                        if (health) {
                            userContext += `\nLatest Health Stats: Physical Health ${health.physicalHealth}/100, Mental Health ${health.mentalHealth}/100, Overall Wellness ${health.overallWellness}/100.`;
                        }
                        userContext += `\n\nINSTRUCTIONS:\n1. Address the user by name if appropriate.\n2. If the user mentions severe symptoms (e.g., chest pain, difficulty breathing, high fever), strongly recommend booking an appointment with one of our registered doctors via the platform.\n3. Refer the user to Sanjeevni-affiliated NGOs if they mention financial difficulties or need community support.`;
                    }
                }
            } catch (err) {
                console.error("Context fetch error:", err);
            }
        }

        // Handle different possible input structures
        let lastUserMessage = "";
        if (messages && Array.isArray(messages) && messages.length > 0) {
            lastUserMessage = messages[messages.length - 1].content || messages[messages.length - 1].text || "";
        } else if (message) {
            lastUserMessage = message;
        }

        if (!lastUserMessage) {
            return NextResponse.json(
                { error: 'Message content is required.' },
                { status: 400 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: userContext },
                { role: "user", content: lastUserMessage }
            ],
        });

        const outputText = response.choices[0].message.content || "";

        return NextResponse.json({
            message: {
                role: 'assistant',
                content: outputText
            },
            response: outputText,
            reply: outputText
        });

    } catch (error: any) {
        console.error('OpenAI API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response from AI.', details: error.message },
            { status: 500 }
        );
    }
}
