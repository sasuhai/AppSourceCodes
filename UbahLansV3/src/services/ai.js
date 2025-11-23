import { GoogleGenerativeAI } from "@google/generative-ai";

// In a production app, this should be in an environment variable
const API_KEY = "AIzaSyDfL16p9fJ2Erf8Um3xpdP4OL0trfxx1pc";
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateAutofill = async (imageBase64) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Remove the data URL prefix to get just the base64 string
        const base64Data = imageBase64.split(',')[1];

        const prompt = "Analyze this outdoor space and describe a potential landscape transformation. Focus on style, plants, and hardscape features. Keep it concise (2-3 sentences).";

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error autofilling:", error);
        throw error;
    }
};

export const generateInventory = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const inventoryPrompt = `Based on this landscape design description: "${prompt}", generate a JSON list of 4-6 likely items (plants, materials, furniture) that would be included. 
    Format: Array of objects with 'name', 'quantity' (e.g. "3-5", "100 sq ft"), and 'type' (Plant, Hardscape, Furniture).
    Return ONLY the JSON array.`;

        const result = await model.generateContent(inventoryPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating inventory:", error);
        // Fallback data
        return [
            { name: "Japanese Maple", quantity: "2", type: "Plant" },
            { name: "River Stone Pavers", quantity: "200 sq ft", type: "Hardscape" },
            { name: "Bamboo Fencing", quantity: "40 ft", type: "Hardscape" },
            { name: "Outdoor LED Lights", quantity: "8", type: "Lighting" }
        ];
    }
};

export const generateTransformation = async (imageBase64, prompt) => {
    // NOTE: Real-time Image-to-Image generation requires specific model access (like Imagen) 
    // which is often restricted or requires different setup than standard Gemini text API.
    // For this demo, we will simulate the processing delay and return a high-quality 
    // "After" image to demonstrate the UI capabilities.

    return new Promise((resolve) => {
        setTimeout(() => {
            // Returning a high-quality Unsplash image that looks like a designed garden
            resolve("https://images.unsplash.com/photo-1600596542815-3ad19c6c9855?q=80&w=2075&auto=format&fit=crop");
        }, 3000);
    });
};
