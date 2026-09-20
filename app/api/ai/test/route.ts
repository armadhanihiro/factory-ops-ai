import { NextResponse } from "next/server";
import { gemini } from "@/lib/ai/gemini";

export async function GET() {
    try {
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Reply with exactly: LinePilot Gemini connection successful",
        });

        return NextResponse.json({
            success: true,
            model: "gemini-2.5-flash",
            response: response.text,
        });
    } catch (error) {
        console.error("Gemini connection test failed:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown Gemini error",
            },
            { status: 500 },
        );
    }
}