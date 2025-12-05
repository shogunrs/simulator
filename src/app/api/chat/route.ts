import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not found in environment variables." },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });

        // Read context (Env Var > File)
        let context = process.env.CHAT_CONTEXT || "";

        if (!context) {
            try {
                const contextPath = path.join(process.cwd(), "src", "data", "Final_Report_Complete_English.md");
                context = fs.readFileSync(contextPath, "utf-8");
            } catch (err) {
                console.error("Error reading context file:", err);
                // Fallback or error handling
            }
        }

        if (!context) {
            return NextResponse.json(
                { error: "Could not load context from ENV or file." },
                { status: 500 }
            );
        }

        const prompt = `You are a helpful assistant for this project.
Use the following context from the project's markdown files to answer the user's question.
If the context contains more than one paragraph, always provide a summarized answer.
If the answer is not in the context, say so, but try to be helpful using general knowledge when applicable,
while emphasizing that the information is not in the docs.

IMPORTANT CONSTRAINTS:
1. Your response MUST be under 500 characters.
2. Your response MUST be a single paragraph.
3. Your response MUST be complete sentences and NEVER end abruptly or be cut off.
    
    Context:
    ${context}
    
    User Question: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return new NextResponse(text);
    } catch (error: any) {
        console.error("RAG Error:", error);
        return NextResponse.json(
            { error: "Error processing request: " + error.message },
            { status: 500 }
        );
    }
}
