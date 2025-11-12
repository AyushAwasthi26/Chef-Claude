// npm install @google/genai @huggingface/inference

import { GoogleGenAI } from "@google/genai";
import { HfInference } from "@huggingface/inference";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `
You are **Chef Claude**, a professional culinary director and master recipe developer. Your tone is authoritative, concise, and focused on technique.
Your task is to analyze the user's provided ingredients and design one sophisticated, yet simple recipe.

**Instructions for Recipe Generation:**
1.  **Utilize Core Ingredients:** Feature at least 70% of the user's ingredients prominently.
2.  **Minimal Additions:** Only suggest 2-3 common staple ingredients (like oil, salt, pepper) not listed by the user.
3.  **Detail & Precision:** Provide precise quantities (e.g., "1 tbsp minced garlic," "1/2 cup diced onion," not just "some garlic") and active cooking times.
4.  **Use Classic Dish Names:** The recipe title **MUST** be a widely recognized, **classic culinary dish name** (e.g., "Chicken Tikka Masala," "Coq au Vin," "Ratatouille," "Shahi Paneer"). **Do not create esoteric or overly descriptive titles.**
5.  **Standard Ingredient Terminology:** Use **standard, common English names** for all ingredients (e.g., "Cottage Cheese" instead of "Paneer," "Arugula" instead of "Rocket," "Garbanzo Beans" instead of "Chickpeas") unless the original name is the most common (e.g., "Tofu," "Cilantro").
6.  **Formatting:** The entire response MUST be formatted strictly in GFM Markdown:
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
      contents: [
        {
          parts: [
            {
              text: `I have ${ingredientsString}. Give me one recipe you'd recommend I make!`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      },
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
        {
          role: "user",
          content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`,
        },
      ],
      max_tokens: 1024,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("Mistral API Error:", err.message);
    throw new Error("Mistral fetch failed.");
  }
}

// --- Groq API Fetcher (Generates Recipe Markdown - FASTEST OPTION) ---
// ---- NOT RECOMMENDED FOR PRODUCTION USE, USE GEMINI INSTEAD ----
// ----ONLY USE FOR LOCAL TESTING-----

export async function getRecipeFromGroq(ingredientsArr) {
  // Ensure you have VITE_GROQ_API_KEY set in your .env.local file
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing.");

  // Initialize the Groq Client
  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true, // THIS IS VERY DANGEROUS FOR PRODUCTION USERS, USE WITH CAUTION, just use when testing locally
  });
  const ingredientsString = ingredientsArr.join(", ");

  try {
    const chatCompletion = await groq.chat.completions.create({
      // Use a super-fast model like Llama 3 8B or Mixtral 8x7b
      model: "llama-3.1-8b-instant", // Recommended for speed
      messages: [
        // System Prompt (Chef Claude) for behavior
        { role: "system", content: SYSTEM_PROMPT },
        // User Content (Ingredients)
        {
          role: "user",
          content: `I have ${ingredientsString}. Give me one recipe you'd recommend I make!`,
        },
      ],
      // Temperature is optional, but 0.7 is a good balance for creativity
      temperature: 0.7,
    });

    // Extract the Response Text from the Groq/OpenAI-style response object
    return (
      chatCompletion.choices[0]?.message?.content.trim() ||
      "Recipe generation failed."
    );
  } catch (err) {
    console.error("Groq API Error:", err);
    throw new Error("Recipe fetch failed.");
  }
}
