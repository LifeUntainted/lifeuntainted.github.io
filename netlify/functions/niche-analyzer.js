// netlify/functions/niche-analyzer.js

const axios = require('axios');

exports.handler = async function(event, context) {
  const userInput = JSON.parse(event.body);

  const prompt = `
You are an advanced AI Niche Analyzer. Based on the following user inputs, provide three niche ideas tailored to their strengths and market demand.

User Inputs:
1. Interests and Passions: ${userInput.interests}
2. Skills and Expertise: ${userInput.skills}
3. Target Audience: ${userInput.audience}
4. Monetization Preferences: ${userInput.monetization}
5. Trends and Market Gaps: ${userInput.trends}
6. Competition Analysis: ${userInput.competition}
7. Niche Durability and Scalability: ${userInput.scalability}
8. Geographic Focus: ${userInput.geographic}

Provide the output in the following format:

- **Niche Idea #1**: [Title]
  - **Description**: [Brief description]
  - **Why It's a Good Fit**: [Explanation]

[Repeat for Niche Idea #2 and #3]
`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const aiResponse = response.data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ result: aiResponse })
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error processing your request.' })
    };
  }
};
