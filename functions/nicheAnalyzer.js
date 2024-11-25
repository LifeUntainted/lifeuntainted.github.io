const { Configuration, OpenAIApi } = require("openai");

exports.handler = async (event) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const { interests, skills, audience, monetization, trends, geographic } = JSON.parse(event.body);

  if (!interests || !skills || !audience || !monetization) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Required fields missing. Please include interests, skills, audience, and monetization.",
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

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ result: response.data.choices[0].text.trim() }),
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to analyze niche. Please try again." }),
    };
  }
};
