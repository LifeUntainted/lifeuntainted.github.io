// File: netlify/functions/nicheAnalyzer.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Parse the incoming request (expected to be a POST request)
    const body = JSON.parse(event.body);

    // Extract user inputs from the body
    const { interests, skills, audience, monetization, trends, competition, scalability, geographic } = body;

    // Prepare prompt to send to OpenAI
    const prompt = `
      You are an AI assistant that helps people find profitable niches.
      Here are some inputs: 
      - Interests: ${interests}
      - Skills: ${skills}
      - Audience: ${audience}
      - Monetization: ${monetization}
      - Trends: ${trends}
      - Competition Level: ${competition}
      - Scalability: ${scalability}
      - Geographic Region: ${geographic}

      Based on this information, suggest 3 potential niches that could be profitable. Provide a brief analysis of each niche, including potential ways to monetize them.
    `;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();

    // Respond with the result from OpenAI
    return {
      statusCode: 200,
      body: JSON.stringify({ result: data.choices[0].text })
    };

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to analyze niche. Please try again." })
    };
  }
};
