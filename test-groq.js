
const Groq = require('groq-sdk');
const dotenv = require('dotenv');
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function main() {
    try {
        console.log("Using API Key:", process.env.GROQ_API_KEY ? "PRESENT" : "MISSING");
        console.log("Model: llama-3.3-70b-versatile");

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Hello, respond with 'PONG'",
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        console.log("Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Test Error:", error);
    }
}

main();
