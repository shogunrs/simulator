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

        // Read context file
        const contextPath = path.join(process.cwd(), "src", "data", "Final_Report_Complete_English.md");
        let context = "";
        try {
            context = fs.readFileSync(contextPath, "utf-8");
        } catch (err) {
            console.error("Error reading context file:", err);
            return NextResponse.json(
                { error: "Could not read context file." },
                { status: 500 }
            );
        }

        const prompt = `You are a helpful assistant for this project. 
    Use the following context from the project's markdown files to answer the user's question.
    If the answer is not in the context, say so, but try to be helpful based on general knowledge if applicable, 
    but emphasize that it's not in the docs.
    
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
