const { Configuration, OpenAIApi } = require("openai");

// Load environment variables (for local development)
require('dotenv').config();

// Set up OpenAI configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key stored securely in GitHub Secrets
});
const openai = new OpenAIApi(configuration);

// Request handling function
exports.handler = async (req, res) => {
    console.log("Received Event:", JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        return res.status(405).json({
            message: "Method Not Allowed, please use POST",
        });
    }

    try {
        // Extract body data
        const { interests, skills, audience, monetization, trends, geographic } = req.body;

        // Validate inputs
        if (!interests || !skills || !audience || !monetization) {
            return res.status(400).json({
                message: "Required fields missing. Please include interests, skills, audience, and monetization.",
            });
        }

        // Create prompt for OpenAI API
        const prompt = `
            You are an AI assistant that helps people find profitable niches for their businesses.
            Here are some inputs from a user who is looking for niche ideas:
            - Interests: ${interests}
            - Skills: ${skills}
            - Audience: ${audience}
            - Monetization strategies: ${monetization.join(', ')}
            - Trends they're interested in: ${trends || 'N/A'}
            - Geographic Region: ${geographic || 'N/A'}
        
            Based on this information, suggest 3 potential niches that could be profitable. For each niche:
            1. Describe the niche.
            2. Explain why it could be profitable.
            3. Suggest a few ways to monetize it effectively.
        `;

        // Get a response from OpenAI
        const response = await openai.createCompletion({
            model: "text-davinci-003", // Updated to use the more common model name
            prompt: prompt,
            max_tokens: 300,
            temperature: 0.7,
            n: 1,
        });

        // Log OpenAI response for debugging
        console.log(response.data);

        if (response.data.choices && response.data.choices.length > 0) {
            const nicheIdeas = response.data.choices[0].text.trim();

            return res.status(200).json({
                result: nicheIdeas,
            });
        } else {
            console.error("Failed to get valid response from OpenAI API", response.data);
            return res.status(500).json({
                error: "Failed to generate niche ideas. No valid response from OpenAI.",
            });
        }

    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return res.status(500).json({
            error: "Failed to analyze niche. Please try again.",
        });
    }
};

// Note: If you're using an Express.js server for GitHub Pages or a custom server, make sure this function is called accordingly.
