const { Configuration, OpenAIApi } = require("openai");

// Set up the OpenAI API configuration only once
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Reusable function for generating common headers
const createHeaders = (contentType = "application/json") => ({
  "Access-Control-Allow-Origin": "*",
  "Content-Type": contentType,
});

exports.handler = async (event) => {
  try {
    // Validate input and parse JSON safely
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: createHeaders(),
        body: JSON.stringify({
          error: "Invalid JSON format in request body.",
        }),
      };
    }

    const { interests, skills, audience, monetization, trends, geographic } = parsedBody;

    // Validate that all required fields are present
    if (!interests || !skills || !audience || !monetization || !Array.isArray(monetization)) {
      return {
        statusCode: 400,
        headers: createHeaders(),
        body: JSON.stringify({
          error: "Required fields missing or invalid. Please include interests, skills, audience, and monetization as an array.",
        }),
      };
    }

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

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    return {
      statusCode: 200,
      headers: createHeaders(),
      body: JSON.stringify({ result: response.data.choices[0]?.text.trim() }),
    };

  } catch (error) {
    console.error("Error calling OpenAI API:", error.message, error.stack);
    return {
      statusCode: 500,
      headers: createHeaders(),
      body: JSON.stringify({
        error: "Failed to analyze niche. Please try again.",
      }),
    };
  }
};
