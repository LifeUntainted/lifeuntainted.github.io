const { Configuration, OpenAIApi } = require("openai");

exports.handler = async (event) => {
  // Set CORS headers for preflight requests (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({}),
    };
  }

  // Set up OpenAI API Configuration
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  // Parse request body
  const { interests, skills, audience, monetization, trends, geographic } = JSON.parse(event.body);

  // Validate request parameters
  if (!interests || !skills || !audience || !monetization) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS
      },
      body: JSON.stringify({
        error: "Required fields missing. Please include interests, skills, audience, and monetization.",
      }),
    };
  }

  // Create prompt for OpenAI
  const prompt = `
    You are an AI assistant that helps people find profitable niches for their businesses.
    Here are some inputs from a user who is looking for niche ideas:
    - Interests: ${interests}
    - Skills: ${skills}
    - Audience: ${audience}
    - Monetization strategies: ${monetization.join(", ")}
    - Trends they're interested in: ${trends || "N/A"}
    - Geographic Region: ${geographic || "N/A"}

    Based on this information, suggest 3 potential niches that could be profitable. For each niche:
    1. Describe the niche.
    2. Explain why it could be profitable.
    3. Suggest a few ways to monetize it effectively.
  `;

  try {
    // Make request to OpenAI
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    // Return successful response
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS
      },
      body: JSON.stringify({ result: response.data.choices[0].text.trim() }),
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS
      },
      body: JSON.stringify({ error: "Failed to analyze niche. Please try again." }),
    };
  }
};
