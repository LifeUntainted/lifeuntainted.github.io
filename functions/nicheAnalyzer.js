const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, 
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const formData = JSON.parse(event.body);

    const prompt = `Based on these inputs, generate three profitable niche business ideas:
      Interests: ${formData.interests}
      Skills: ${formData.skills}
      Audience: ${formData.audience}
      Monetization: ${formData.monetization.join(', ')}
      Trends: ${formData.trends}
      Geographic Focus: ${formData.geographic}
    `;

    const response = await openai.createCompletion({
      model: "text-davinci-003", // Or whichever model you prefer
      prompt: prompt,
      max_tokens: 200, 
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ result: response.data.choices[0].text.trim() }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate niche ideas' }),
    };
  }
};
