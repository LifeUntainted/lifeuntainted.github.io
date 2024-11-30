// api/submitForm.js

const { Configuration, OpenAIApi } = require("openai");

module.exports = async (req, res) => {
  // Ensure it's a POST request
  if (req.method !== 'POST') {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Parse request body
  const { interests, skills, audience, monetization, trends, geographic } = req.body;

  // Validate request parameters
  if (!interests || !skills || !audience || !monetization) {
    return res.status(400).json({
      error: "Required fields missing. Please include interests, skills, audience, and monetization.",
    });
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

  // Set up OpenAI API Configuration
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    // Make request to OpenAI
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = response.data.choices[0].text.trim();

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
    console.error("Error calling OpenAI API:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: "Failed to analyze niche. Please try again." });
  }
};
