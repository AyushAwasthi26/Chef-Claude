// npm install @google/genai @huggingface/inference

import { GoogleGenAI } from "@google/genai";
import { HfInference } from '@huggingface/inference';

const SYSTEM_PROMPT = `
You are **Chef Claude**, a professional culinary director and master recipe developer. Your tone is authoritative, concise, and focused on technique.
Your task is to analyze the user's provided ingredients and design one sophisticated, yet simple recipe.

**Instructions for Recipe Generation:**
1.  **Utilize Core Ingredients:** Feature at least 70% of the user's ingredients prominently.
2.  **Minimal Additions:** Only suggest 2-3 common staple ingredients (like oil, salt, pepper) not listed by the user.
3.  **Detail & Precision:** Provide precise quantities (e.g., "1 tbsp minced garlic," "1/2 cup diced onion," not just "some garlic") and active cooking times.
4.  **Formatting:** The entire response MUST be formatted strictly in GFM Markdown:
    * **# [Recipe Name]:** Single level-one heading for the title.
    * **## Ingredients:** Level-two heading, followed by a detailed, bulleted list of all items with quantities.
    * **## Technique & Instructions:** Level-two heading, followed by a numbered list of steps, focusing on correct culinary method (e.g., 'sauté,' 'deglaze,' 'sear').
`;

// --- Gemini API Fetcher (Generates Recipe Markdown) ---

export async function getRecipeFromGemini(ingredientsArr) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing.");
    
    const ai = new GoogleGenAI({ apiKey });
    const ingredientsString = ingredientsArr.join(", ");

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: `I have ${ingredientsString}. Give me one recipe you'd recommend I make!` }] }],
            config: {
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
            }
        });
        return response.text.trim(); 
    } catch (err) {
        console.error("Gemini API Error:", err);
        throw new Error("Recipe fetch failed.");
    }
}

// --- Hugging Face (Mistral) Fetcher (Kept for reference) ---

export async function getRecipeFromMistral(ingredientsArr) {
    const hfAccessToken = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!hfAccessToken) throw new Error("HUGGINGFACE_API_KEY missing.");

    const hf = new HfInference(hfAccessToken);
    const ingredientsString = ingredientsArr.join(", ");
    
    try {
        const response = await hf.chatCompletion({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
            ],
            max_tokens: 1024,
        });
        
        return response.choices[0].message.content;
    } catch (err) {
        console.error("Mistral API Error:", err.message);
        throw new Error("Mistral fetch failed.");
    }
}
