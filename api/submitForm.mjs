// api/submitForm.js

import OpenAI from "openai";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://www.321niche.com"); // Replace with your frontend domain
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ensure it's a POST request
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Parse request body
  let body = req.body;
  if (!body || typeof body !== "object") {
    try {
      body = JSON.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON in request body." });
    }
  }

  const { interests, skills, audience, monetization, trends, geographic } = body;

  // Validate request parameters
  if (!interests || !skills || !audience || !monetization) {
    return res.status(400).json({
      error:
        "Required fields missing. Please include interests, skills, audience, and monetization.",
    });
  }

  // Create the OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can change the model if needed
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps people find profitable niches for their businesses.",
        },
        {
          role: "user",
          content: `
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
`,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content.trim();

    // Try to parse the AI response as JSON
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", aiResponse);
      return res.status(500).json({ error: "AI response is not valid JSON." });
    }

    // Return successful response
    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error(
      "Error calling OpenAI API:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({ error: "Failed to analyze niche. Please try again." });
  }
}
