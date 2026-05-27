/**
 * AUTO OUTREACH MODULE
 * Sends outreach messages via email (Gmail/NodeMailer)
 * Includes random delays to avoid spam detection
 */
const nodemailer = require("nodemailer");
const config = require("../lib/config");
const { randomDelay, log, today, generateId } = require("../lib/utils");
const { addOutreachEntry, updateLead, addToFollowupQueue } = require("../lib/data-store");

let transporter = null;

/**
 * Initialize email transporter
 */
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return transporter;
}

/**
 * Send outreach email to a lead
 * @param {object} lead - Lead object
 * @param {object} message - { subject, message }
 * @returns {Promise<boolean>} Success
 */
async function sendEmail(lead, message) {
  if (!lead.email) {
    log("Outreach", `No email for ${lead.name}, skipping`);
    return false;
  }

  if (!config.email.user || !config.email.pass) {
    log("Outreach", "Email not configured. Logging message only.");
    logOutreach(lead, message, "dry_run");
    return true;
  }

  try {
    const transport = getTransporter();

    const mailOptions = {
      from: `"${config.email.user.split("@")[0]}" <${config.email.user}>`,
      to: lead.email,
      subject: message.subject,
      text: message.message,
      html: formatHtmlEmail(message.message),
    };

    await transport.sendMail(mailOptions);
    log("Outreach", `Email sent to ${lead.email} (${lead.name})`);

    logOutreach(lead, message, "sent");
    return true;
  } catch (error) {
    log("Outreach", `Failed to send to ${lead.email}: ${error.message}`);
    logOutreach(lead, message, "failed");
    return false;
  }
}

/**
 * Send outreach to multiple leads with delays
 * @param {Array} leads - Array of leads with messages
 * @returns {Promise<object>} Results summary
 */
async function sendBatchOutreach(leadsWithMessages) {
  log("Outreach", `Sending batch of ${leadsWithMessages.length} messages`);

  let sent = 0;
  let failed = 0;

  for (const { lead, message } of leadsWithMessages) {
    const success = await sendEmail(lead, message);

    if (success) {
      sent++;
      // Update lead status
      updateLead(lead.id, {
        status: "outreach_sent",
        outreachSent: true,
        outreachDate: today(),
      });
      // Add to follow-up queue
      addToFollowupQueue({
        leadId: lead.id,
        leadName: lead.name,
        email: lead.email,
        outreachDate: today(),
        followupCount: 0,
        nextFollowup: addDays(today(), config.followup.day2),
      });
    } else {
      failed++;
    }

    // Random delay between emails
    if (leadsWithMessages.indexOf({ lead, message }) < leadsWithMessages.length - 1) {
      log("Outreach", "Waiting between messages...");
      await randomDelay();
    }
  }

  log("Outreach", `Batch complete: ${sent} sent, ${failed} failed`);
  return { sent, failed, total: leadsWithMessages.length };
}

/**
 * Log outreach to data store
 */
function logOutreach(lead, message, status) {
  addOutreachEntry({
    id: generateId(),
    leadId: lead.id,
    leadName: lead.name,
    email: lead.email,
    subject: message.subject,
    status: status,
    sentAt: new Date().toISOString(),
    followupNumber: message.followupNumber || 0,
  });
}

/**
 * Format plain text as simple HTML email
 */
function formatHtmlEmail(text) {
  const paragraphs = text
    .split("\n\n")
    .map((p) => `<p style="margin: 0 0 12px 0; line-height: 1.5;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #333; max-width: 600px;">${paragraphs}</div>`;
}

/**
 * Add days to a date string
 */
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

module.exports = { sendEmail, sendBatchOutreach };
