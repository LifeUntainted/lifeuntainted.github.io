import OpenAI from "openai";

export default async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ensure it's a POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Parse request body
  let requestBody = req.body;
  if (!requestBody) {
    let body = "";
    await new Promise((resolve) => {
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", resolve);
    });
    try {
      requestBody = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON in request body." });
    }
  }

  const { interests, skills, audience, monetization, trends, geographic } = requestBody;

  if (!interests || !skills || !audience || !monetization) {
    return res.status(400).json({
      error: "Required fields missing. Please include interests, skills, audience, and monetization.",
    });
  }

  try {
    // Create OpenAI API instance with API key from Vercel environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Vercel should have this variable set up
    });

    // Prepare prompt for OpenAI API
    const prompt = `
      You are an AI assistant that helps people find profitable niches for their businesses.
      Here are some inputs from a user who is looking for niche ideas:
      - Interests: ${interests}
      - Skills: ${skills}
      - Audience: ${audience}
      - Monetization strategies: ${monetization.join(", ")}
      - Trends they're interested in: ${trends || "N/A"}
      - Geographic Region: ${geographic || "N/A"}

      Based on this information, suggest 3 potential niches that could be profitable.

      For each niche, provide the following information:

      {
        "title": "Niche Title",
        "description": "Brief description of the niche.",
        "monetizationStrategies": ["Strategy 1", "Strategy 2"]
      }

      Please present the niches as a JSON array like this:

      [
        {
          "title": "Niche Title",
          "description": "Brief description of the niche.",
          "monetizationStrategies": ["Strategy 1", "Strategy 2"]
        },
        ...
      ]

      Please output only the JSON array, without any additional text.
    `;

    // Request completion from GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message?.content.trim();

    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponse);
      return res.status(500).json({ error: "AI response is not valid JSON." });
    }

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: "Failed to analyze niche. Please try again." });
  }
};
