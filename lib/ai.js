/**
 * AI Module - Handles all AI text generation
 * Supports Groq (free tier) and OpenAI
 */
const config = require("./config");

let groqClient = null;
let openaiClient = null;

function getClient() {
  if (config.ai.provider === "groq") {
    if (!groqClient) {
      const Groq = require("groq-sdk");
      groqClient = new Groq({ apiKey: config.ai.groqApiKey });
    }
    return { type: "groq", client: groqClient };
  } else {
    if (!openaiClient) {
      const OpenAI = require("openai");
      openaiClient = new OpenAI({ apiKey: config.ai.openaiApiKey });
    }
    return { type: "openai", client: openaiClient };
  }
}

/**
 * Generate text using AI
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User message
 * @returns {Promise<string>} Generated text
 */
async function generate(systemPrompt, userPrompt) {
  const { type, client } = getClient();

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  if (type === "groq") {
    const response = await client.chat.completions.create({
      model: config.ai.model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || "";
  } else {
    const response = await client.chat.completions.create({
      model: config.ai.model || "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || "";
  }
}

/**
 * Generate JSON output from AI
 */
async function generateJSON(systemPrompt, userPrompt) {
  const text = await generate(
    systemPrompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation.",
    userPrompt
  );
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(text);
}

module.exports = { generate, generateJSON };
