/**
 * AI REPLY ASSISTANT MODULE
 * Analyzes incoming replies, detects intent, and suggests responses
 */
const { generate, generateJSON } = require("../lib/ai");
const { log } = require("../lib/utils");

/**
 * Analyze a reply to detect intent
 * @param {string} replyText - The reply message
 * @returns {Promise<object>} { intent, confidence, suggestedAction }
 */
async function analyzeReply(replyText) {
  log("ReplyAssistant", "Analyzing reply intent");

  const systemPrompt = `Analyze this email reply and classify the intent. Return JSON:
{
  "intent": "interested" | "not_interested" | "question" | "meeting_request" | "unsubscribe" | "out_of_office" | "unclear",
  "confidence": 0.0-1.0,
  "suggestedAction": "book_meeting" | "answer_question" | "send_info" | "remove_lead" | "wait" | "follow_up_later",
  "summary": "brief summary of what they said"
}`;

  try {
    const result = await generateJSON(systemPrompt, `Reply: "${replyText}"`);
    return result;
  } catch (e) {
    return {
      intent: "unclear",
      confidence: 0.5,
      suggestedAction: "wait",
      summary: "Could not parse reply",
    };
  }
}

/**
 * Generate a suggested reply based on intent
 * @param {object} lead - Lead data
 * @param {string} theirReply - What they said
 * @param {object} analysis - Intent analysis result
 * @returns {Promise<string>} Suggested reply message
 */
async function suggestReply(lead, theirReply, analysis) {
  log("ReplyAssistant", `Generating reply suggestion for ${lead.name}`);

  const actionPrompts = {
    book_meeting: "Help them book a meeting. Suggest specific times. Be enthusiastic but not pushy.",
    answer_question: "Answer their question helpfully and push toward a meeting.",
    send_info: "Provide brief, relevant info and suggest a call to discuss further.",
    follow_up_later: "Acknowledge their response warmly and say you will check back.",
  };

  const systemPrompt = `You are replying to a potential client who responded to your outreach.
${actionPrompts[analysis.suggestedAction] || "Be helpful and professional."}

Rules:
- Keep it under 80 words
- Sound human and friendly
- Match their tone
- Push gently toward a meeting/call
- Don't be desperate or overly salesy`;

  const userPrompt = `Business: ${lead.name}
Their reply: "${theirReply}"
Their intent: ${analysis.intent}
Your action: ${analysis.suggestedAction}

Write a reply.`;

  try {
    return await generate(systemPrompt, userPrompt);
  } catch (e) {
    return getDefaultReply(analysis.suggestedAction, lead.name);
  }
}

/**
 * Default reply templates when AI is unavailable
 */
function getDefaultReply(action, businessName) {
  const templates = {
    book_meeting: `Thanks for getting back to me! I'd love to chat about how we can help ${businessName}. Would any time this week work for a quick 15-minute call?`,
    answer_question: `Great question! I'd be happy to explain more. Would it be easier to jump on a quick call? I can walk you through everything in about 15 minutes.`,
    send_info: `Thanks for your interest! I'll put together some info for you. In the meantime, would a brief call work? I can show you some specific ideas for ${businessName}.`,
    follow_up_later: `Thanks for letting me know! No worries at all. I'll check back in a week or two. Best of luck with everything!`,
  };
  return templates[action] || `Thanks for your reply! Would you be open to a quick chat about ${businessName}?`;
}

module.exports = { analyzeReply, suggestReply };
