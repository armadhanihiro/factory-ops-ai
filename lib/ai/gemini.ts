import { GoogleGenAI } from "@google/genai";

const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION ?? "global";

if (!project) {
    throw new Error("GOOGLE_CLOUD_PROJECT environment variable is not configured",);
}

export const gemini = new GoogleGenAI({ vertexai: true, project, location });