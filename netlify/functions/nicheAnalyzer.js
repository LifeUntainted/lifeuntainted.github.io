const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Debugging: Log the entire event to see what is received
  console.log("Received Event:", JSON.stringify(event, null, 2));

  // Check if the request method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Method Not Allowed, please use POST" })
    };
  }

  try {
    // Parse the incoming request body (expecting JSON format)
    let body;

    // To avoid errors when the body is empty
    if (event.body) {
      body = JSON.parse(event.body);
    } else {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Invalid request, body cannot be empty." })
      };
    }

    // Extract user inputs from the body
    const { interests, skills, audience, monetization, trends, competition, scalability, geographic } = body;

    // Validate required fields (in case some inputs are missing)
    if (!interests || !skills || !audience || !monetization) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Required fields missing. Please include interests, skills, audience, and monetization." })
      };
    }

    // Prepare a detailed prompt to send to OpenAI to generate niche ideas
    const prompt = `
      You are an AI assistant that helps people find profitable niches for their businesses.
      Here are some inputs from a user who is looking for niche ideas:
      - Interests: ${interests}
      - Skills: ${skills}
      - Audience: ${audience}
      - Monetization strategies: ${monetization}
      - Trends they're interested in: ${trends || 'N/A'}
      - Competition Level: ${competition || 'N/A'}
      - Scalability: ${scalability || 'N/A'}
      - Geographic Region: ${geographic || 'N/A'}

      Based on this information, suggest 3 potential niches that could be profitable. For each niche:
      1. Describe the niche.
      2. Explain why it could be profitable.
      3. Suggest a few ways to monetize it effectively.
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
        max_tokens: 300,
        temperature: 0.7,
        n: 1 // Get one response
      })
    });

    if (!response.ok) {
      console.error(`OpenAI API responded with status ${response.status}: ${response.statusText}`);
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    // Get the response from OpenAI and parse it
    const data = await response.json();

    // Check if OpenAI provided a valid response
    if (data.choices && data.choices.length > 0) {
      const nicheIdeas = data.choices[0].text.trim();

      // Return a successful response with the generated niche ideas
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",  // Allow cross-origin
        },
        body: JSON.stringify({ result: nicheIdeas })
      };
    } else {
      console.error("Failed to get valid response from OpenAI API", data);
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Failed to generate niche ideas. No valid response from OpenAI." })
      };
    }

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to analyze niche. Please try again." })
    };
  }
};
