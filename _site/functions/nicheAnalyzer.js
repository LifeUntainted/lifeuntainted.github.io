// Import the OpenAI library
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// In-memory store for request counts
const requestCounts = {};
const MAX_REQUESTS_PER_DAY = 3; // Adjust as needed

// Lambda Function Handler
exports.handler = async (event) => {
    console.log("Received Event:", JSON.stringify(event, null, 2));

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: "Method Not Allowed, please use POST" }),
        };
    }

    try {
        const ip = (event.headers['x-forwarded-for'] || event.headers['client-ip'] || '').split(',')[0];
        const now = Date.now();

        // Rate limiting logic
        if (requestCounts[ip]) {
            const requests = requestCounts[ip];
            requests.push(now);
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            requestCounts[ip] = requests.filter(time => time > oneDayAgo);

            if (requestCounts[ip].length > MAX_REQUESTS_PER_DAY) {
                return {
                    statusCode: 429,
                    body: JSON.stringify({ error: "Too Many Requests. You are limited to 3 requests per day. Please try again tomorrow." }),
                };
            }
        } else {
            requestCounts[ip] = [now];
        }

        let body;

        if (event.body) {
            body = JSON.parse(event.body);
        } else {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Invalid request, body cannot be empty." }),
            };
        }

        const { interests, skills, audience, monetization, trends, geographic } = body;

        if (!interests || !skills || !audience || !monetization) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "Required fields missing. Please include interests, skills, audience, and monetization.",
                }),
            };
        }

        // Creating a prompt for the OpenAI API
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

        // API Call to OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7,
        });

        console.log(response); // Log the OpenAI API response

        if (response.choices && response.choices.length > 0) {
            const nicheIdeas = response.choices[0].message.content.trim();

            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ result: nicheIdeas }),
            };
        } else {
            console.error("Failed to get valid response from OpenAI API", response);
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ error: "Failed to generate niche ideas. No valid response from OpenAI." }),
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
            body: JSON.stringify({ error: "Failed to analyze niche. Please try again." }),
        };
    }
};
