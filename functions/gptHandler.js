import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Common headers to avoid repetition
const createHeaders = (contentType = "application/json") => ({
  "Access-Control-Allow-Origin": "*",
  "Content-Type": contentType,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: createHeaders(),
      body: JSON.stringify({}),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: createHeaders(),
      body: JSON.stringify({ message: "Method Not Allowed, please use POST" }),
    };
  }

  try {
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: createHeaders(),
        body: JSON.stringify({
          message: "Invalid JSON format in request body.",
        }),
      };
    }

    const { message } = parsedBody;

    if (!message) {
      return {
        statusCode: 400,
        headers: createHeaders(),
        body: JSON.stringify({
          message: "Invalid request, message field cannot be empty.",
        }),
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
      const chatResponse = response.choices[0]?.text.trim();

      return {
        statusCode: 200,
        headers: createHeaders(),
        body: JSON.stringify({ response: chatResponse }),
      };
    } else {
      return {
        statusCode: 500,
        headers: createHeaders(),
        body: JSON.stringify({ error: "No valid response from OpenAI." }),
      };
    }

  } catch (error) {
    console.error("Error calling OpenAI API:", error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      headers: createHeaders(),
      body: JSON.stringify({ error: "Failed to get response from OpenAI API." }),
    };
  }
};
