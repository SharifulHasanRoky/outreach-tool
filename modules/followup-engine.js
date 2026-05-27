/**
 * FOLLOW-UP ENGINE MODULE
 * Automatically sends follow-ups at scheduled intervals
 * Day 2: Reminder | Day 5: Value message | Day 10: Final
 */
const config = require("../lib/config");
const { daysSince, log, today } = require("../lib/utils");
const {
  getFollowupQueue,
  removeFromFollowupQueue,
  updateLead,
  getLeads,
} = require("../lib/data-store");
const { generateFollowup } = require("./outreach-generator");
const { sendEmail } = require("./auto-outreach");

/**
 * Process the follow-up queue
 * Checks which leads need follow-up today
 */
async function processFollowups() {
  const queue = getFollowupQueue();
  log("Followup", `Processing ${queue.length} leads in queue`);

  let sent = 0;
  let skipped = 0;

  for (const entry of queue) {
    const days = daysSince(entry.outreachDate);

    // Determine if follow-up is due
    let followupNumber = null;

    if (entry.followupCount === 0 && days >= config.followup.day2) {
      followupNumber = 1;
    } else if (entry.followupCount === 1 && days >= config.followup.day5) {
      followupNumber = 2;
    } else if (entry.followupCount === 2 && days >= config.followup.day10) {
      followupNumber = 3;
    }

    if (!followupNumber) {
      skipped++;
      continue;
    }

    // Check if lead has already replied
    const leads = getLeads();
    const lead = leads.find((l) => l.id === entry.leadId);
    if (!lead || lead.status === "replied" || lead.status === "interested" || lead.status === "meeting_booked") {
      removeFromFollowupQueue(entry.leadId);
      skipped++;
      continue;
    }

    // Generate and send follow-up
    try {
      const message = await generateFollowup(lead, followupNumber);
      const success = await sendEmail(lead, message);

      if (success) {
        sent++;
        // Update queue entry
        entry.followupCount = followupNumber;
        entry.lastFollowup = today();

        // Update lead
        updateLead(lead.id, { followupCount: followupNumber });

        // Remove from queue after final follow-up
        if (followupNumber >= 3) {
          removeFromFollowupQueue(entry.leadId);
          updateLead(lead.id, { status: "no_response" });
        }
      }
    } catch (error) {
      log("Followup", `Error following up with ${entry.leadName}: ${error.message}`);
    }
  }

  log("Followup", `Done: ${sent} sent, ${skipped} skipped`);
  return { sent, skipped };
}

module.exports = { processFollowups };
