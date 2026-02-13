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
    console.log("POST /api/chat - Request started");
    try {
        let body;
        try {
            body = await req.json();
            console.log("Request body parsed successfully");
        } catch (jsonErr) {
            console.error("JSON Parse Error in request body:", jsonErr);
            return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
        }

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
            console.log("Token found, fetching user context...");
            try {
                const decoded: any = verifyToken(token);
                if (decoded) {
                    console.log("Token verified for user:", decoded.email);
                    console.log("Connecting to DB...");
                    await dbConnect();
                    console.log("DB Connected. Fetching data...");
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

        console.log("Chat Request Received. Body keys:", Object.keys(body));

        // Construct proper message history for Groq
        const groqMessages = [
            { role: "system", content: userContext }
        ];

        // Add history messages ONLY if user is authenticated (token exists)
        if (token && messages && Array.isArray(messages)) {
            messages.forEach((m: any, idx: number) => {
                console.log(`History message ${idx}: role=${m.role}, contentLen=${m.content?.length}`);
                if (m.role && m.content) {
                    groqMessages.push({ role: m.role, content: m.content });
                }
            });
        }


        // Add the current latest message if it's not already at the end of history
        const lastGroqMessage = groqMessages[groqMessages.length - 1];
        if (message && (!lastGroqMessage || lastGroqMessage.content !== message)) {
            console.log("Adding new user message to groqMessages");
            groqMessages.push({ role: "user", content: message });
        }

        console.log("Final GROQ Messages count:", groqMessages.length);
        console.log("GROQ Messages summary:", groqMessages.map(m => `[${m.role}]`).join(' -> '));

        if (groqMessages.length === 1) { // Only system message present
            return NextResponse.json(
                { error: 'Message content is required.' },
                { status: 400 }
            );
        }

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Groq API key is missing. Please check your .env file.' },
                { status: 500 }
            );
        }

        console.log("Calling Groq completions...");
        const stream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages as any,
            stream: true,
        });
        console.log("Groq stream created successfully.");

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    let chunkCount = 0;
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            chunkCount++;
                            if (chunkCount === 1) console.log("First chunk sent!");
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                    console.log(`Stream closed. Total chunks sent: ${chunkCount}`);
                    controller.close();
                } catch (streamError: any) {
                    console.error('Streaming error:', streamError);
                    controller.error(streamError);
                }
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
            { error: error.message || 'Failed to generate response from AI.' },
            { status: 500 }
        );
    }
}
