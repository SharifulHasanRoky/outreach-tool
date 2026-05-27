/**
 * OUTREACH GENERATOR MODULE
 * Creates personalized outreach messages based on audit findings
 */
const { generate } = require("../lib/ai");
const { log } = require("../lib/utils");

/**
 * Generate personalized outreach message
 * @param {object} lead - Lead data with audit results
 * @returns {Promise<object>} { subject, message }
 */
async function generateOutreach(lead) {
  log("OutreachGen", `Generating outreach for: ${lead.name}`);

  const systemPrompt = `You are a friendly business development professional. Write short, personalized cold outreach emails.

Rules:
- Keep it under 100 words
- Sound human and conversational (NOT salesy)
- Mention the business name
- Reference ONE specific problem you found
- Suggest you have ideas to help
- End with a soft CTA (not pushy)
- Do NOT use generic templates
- Do NOT use emojis excessively
- Do NOT mention "audit" or "tool" - make it sound like you personally checked

Output format:
SUBJECT: [subject line]
MESSAGE: [email body]`;

  const issues =
    lead.audit?.issues?.length > 0
      ? lead.audit.issues.slice(0, 3).join(", ")
      : "general website improvements needed";

  const userPrompt = `Business: ${lead.name}
Website: ${lead.website}
Issues Found: ${issues}
Audit Summary: ${lead.audit?.summary || "Website needs improvement"}
Score: ${lead.audit?.score || "N/A"}/100

Write a personalized outreach email to this business owner.`;

  try {
    const response = await generate(systemPrompt, userPrompt);

    // Parse subject and message
    const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|MESSAGE:)/s);
    const messageMatch = response.match(/MESSAGE:\s*([\s\S]+)/);

    return {
      subject: subjectMatch
        ? subjectMatch[1].trim()
        : `Quick idea for ${lead.name}`,
      message: messageMatch ? messageMatch[1].trim() : response.trim(),
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    log("OutreachGen", `AI error, using template: ${error.message}`);
    return generateFallbackMessage(lead);
  }
}

/**
 * Generate follow-up message (slightly different each time)
 * @param {object} lead - Lead data
 * @param {number} followupNumber - Which follow-up (1, 2, or 3)
 * @returns {Promise<object>} { subject, message }
 */
async function generateFollowup(lead, followupNumber) {
  log("OutreachGen", `Generating follow-up #${followupNumber} for: ${lead.name}`);

  const templates = {
    1: "Write a brief, friendly follow-up. Mention you reached out before. Add a tiny bit of extra value (a quick tip). Keep it under 60 words.",
    2: "Write a value-focused follow-up. Share one actionable tip related to their website issue. Keep it helpful, not pushy. Under 80 words.",
    3: "Write a final, graceful follow-up. Be respectful of their time. Mention this is the last message. Offer to help if they ever need it. Under 50 words.",
  };

  const systemPrompt = `You are a friendly business development professional writing a follow-up email.
${templates[followupNumber] || templates[1]}

Rules:
- Sound human and casual
- Reference the business by name
- Do NOT be pushy or desperate
- Keep a warm, professional tone

Output format:
SUBJECT: [subject line]
MESSAGE: [email body]`;

  const userPrompt = `Business: ${lead.name}
Original issue mentioned: ${lead.audit?.issues?.[0] || "website improvements"}
Follow-up number: ${followupNumber}`;

  try {
    const response = await generate(systemPrompt, userPrompt);

    const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|MESSAGE:)/s);
    const messageMatch = response.match(/MESSAGE:\s*([\s\S]+)/);

    return {
      subject: subjectMatch
        ? subjectMatch[1].trim()
        : `Following up - ${lead.name}`,
      message: messageMatch ? messageMatch[1].trim() : response.trim(),
      followupNumber,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return generateFallbackFollowup(lead, followupNumber);
  }
}

/**
 * Fallback template when AI is unavailable
 */
function generateFallbackMessage(lead) {
  const issue = lead.audit?.issues?.[0] || "some areas that could improve conversions";
  return {
    subject: `Quick thought about ${lead.name}'s website`,
    message: `Hi there,

I was looking at ${lead.name}'s website and noticed ${issue}. 

I had a couple of ideas that might help improve things. Would you be open to a quick chat?

Best regards`,
    generatedAt: new Date().toISOString(),
  };
}

function generateFallbackFollowup(lead, num) {
  const messages = {
    1: `Hi! Just following up on my previous message about ${lead.name}. Happy to share a few quick ideas if you're interested.`,
    2: `Hey! I had one more thought about ${lead.name}'s online presence that could help with leads. Let me know if you'd like to hear it.`,
    3: `Hi! This is my last note. If you ever want to chat about improving ${lead.name}'s website, I'm here. Wishing you the best!`,
  };

  return {
    subject: `Re: Quick thought about ${lead.name}`,
    message: messages[num] || messages[1],
    followupNumber: num,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { generateOutreach, generateFollowup };
