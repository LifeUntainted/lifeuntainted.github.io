import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define reusable headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
};

export const handler = async (event) => {
    // Set CORS headers for preflight requests (OPTIONS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({}),
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Method Not Allowed, please use POST" })
        };
    }

    try {
        const { message } = JSON.parse(event.body);
        if (!message) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ message: "Invalid request, message field cannot be empty." })
            };
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: message }],
            response_format: "text",
            temperature: 1,
            max_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        if (response.choices && response.choices.length > 0) {
            const chatResponse = response.choices[0].text.trim();

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ response: chatResponse })
            };
        } else {
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: "No valid response from OpenAI." })
            };
        }

    } catch (error) {
        console.error("Error calling OpenAI API:", error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Failed to get response from OpenAI API." })
        };
    }
};
