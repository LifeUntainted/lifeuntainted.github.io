// niche-analyzer.js
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  const { interests, skills, audience, monetization, trends, competition, scalability, geographic } = JSON.parse(event.body);

  // Construct a prompt to send to OpenAI
  const prompt = `
    Based on the following user inputs, generate a few profitable niche ideas along with a brief explanation of why they might work.
    Interests: ${interests}
    Skills: ${skills}
    Audience: ${audience}
    Monetization Strategies: ${monetization.join(", ")}
    Trends: ${trends}
    Competition: ${competition}
    Scalability: ${scalability}
    Geographic Region: ${geographic}
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-004",
        prompt: prompt,
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ result: data.choices[0].text.trim() }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "No valid response from OpenAI" }),
      };
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error calling OpenAI API" }),
    };
  }
};
