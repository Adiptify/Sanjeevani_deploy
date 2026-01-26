import { NextRequest, NextResponse } from 'next/server';
import { Ollama } from 'ollama';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://ollama.com';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_API_KEYS = process.env.OLLAMA_API_KEYS ? process.env.OLLAMA_API_KEYS.split(',') : [];

// Function to get an API key (rotates if multiple are provided)
function getApiKey() {
    if (OLLAMA_API_KEYS.length > 0) {
        // Simple random rotation
        return OLLAMA_API_KEYS[Math.floor(Math.random() * OLLAMA_API_KEYS.length)].trim();
    }
    return OLLAMA_API_KEY;
}

export async function POST(req: NextRequest) {
    try {
        const { messages, model = 'gpt-oss:120b' } = await req.json();

        const apiKey = getApiKey();

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OLLAMA_API_KEY or OLLAMA_API_KEYS is not configured on the server.' },
                { status: 500 }
            );
        }

        const ollama = new Ollama({
            host: OLLAMA_HOST,
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        const response = await ollama.chat({
            model: model,
            messages: messages,
            stream: false, // Set to false for simple JSON response
        });

        return NextResponse.json({
            message: response.message,
            response: response.message.content
        });

    } catch (error: any) {
        console.error('Ollama API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response from AI.', details: error.message },
            { status: 500 }
        );
    }
}
