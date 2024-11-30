// api/submitForm.mjs

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
    // Define the function schema
    const functions = [
      {
        name: "generate_niche_suggestions",
        description: "Generates niche suggestions based on user inputs",
        parameters: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  monetizationStrategies: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["title", "description", "monetizationStrategies"],
              },
            },
          },
          required: ["suggestions"],
        },
      },
    ];

    // Create messages for OpenAI Chat Completion API
    const messages = [
      {
        role: "system",
        content: "You are an AI assistant that helps people find profitable niches for their businesses.",
      },
      {
        role: "user",
        content: `
Please generate 3 potential niches based on the following information:

- Interests: ${interests}
- Skills: ${skills}
- Audience: ${audience}
- Monetization strategies: ${monetization.join(", ")}
- Trends they're interested in: ${trends || "N/A"}
- Geographic Region: ${geographic || "N/A"}

Provide the suggestions in the form of a JSON object following the function schema.`,
      },
    ];

    // Call the OpenAI API with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0613",
      messages: messages,
      functions: functions,
      function_call: { name: "generate_niche_suggestions" },
    });

    const responseMessage = completion.choices[0].message;

    let suggestions;

    if (responseMessage.function_call) {
      const args = JSON.parse(responseMessage.function_call.arguments);
      suggestions = args.suggestions;
    } else {
      throw new Error("No function call in the response");
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
