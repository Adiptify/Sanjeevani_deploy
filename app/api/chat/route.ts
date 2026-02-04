import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import Groq from "groq-sdk";
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Submission from '@/models/Submission';
import HealthData from '@/models/HealthData';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, message } = body;

        const token = req.cookies.get('token')?.value;
        let userContext = `You are Sanjeevni AI, a professional and empathetic healthcare assistant. 
CORE RULES:
1. FOCUS: Only answer questions related to physical and mental health, medicine, symptoms, and wellness. 
2. OFF-TOPIC: If a user asks about non-healthcare topics (like machine learning, coding, history, etc.), politely decline and steer them back to health-related assistance.
3. STRUCTURE: Use markdown tables for comparisons, schedules, or structured data. Use headers (###) and bold text for clarity.
4. TONE: Professional, empathetic, and clear. Explain medical jargon in simple terms.
5. STREAMING: Write in a natural, flow-based manner suitable for real-time streaming.
6. DATA: If user profile or health stats are provided below, use them to personalize your advice.`;

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

        const stream = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: userContext },
                { role: "user", content: lastUserMessage }
            ],
            stream: true,
        });

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('Groq API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response from AI.', details: error.message },
            { status: 500 }
        );
    }
}
