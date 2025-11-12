// api/groq.js
import Groq from "groq-sdk";

export default async function handler(req, res) {
  try {
    // Parse request body (Vercel automatically passes it as a stream)
    const { ingredients } = await req.json();

    // Initialize Groq with your secret key (safe — stays on server)
    const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });

    // Generate recipe
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are Chef Claude, a professional culinary director and master recipe developer.`,
        },
        {
          role: "user",
          content: `I have ${ingredients.join(", ")}. Give me one recipe you'd recommend I make!`,
        },
      ],
      temperature: 0.7,
    });

    const recipe = completion.choices[0].message.content.trim();

    // Send back response
    return new Response(
      JSON.stringify({ recipe }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Groq API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch recipe." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
