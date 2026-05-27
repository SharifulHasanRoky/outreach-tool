/**
 * LEAD FINDER MODULE
 * Finds potential clients from Google Maps, Google Search, etc.
 * Uses Playwright for browser automation
 */
const { generateId, log } = require("../lib/utils");
const { addLead } = require("../lib/data-store");

/**
 * Search Google Maps for businesses in a niche + location
 * @param {object} options - { query, location, maxResults }
 * @returns {Promise<Array>} Array of leads
 */
async function searchGoogleMaps({ query, location, maxResults = 10 }) {
  const { chromium } = require("playwright");
  log("LeadFinder", `Searching Google Maps: "${query}" in "${location}"`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const leads = [];

  try {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(
      query + " " + location
    )}`;
    await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 30000 });

    // Wait for results to load
    await page.waitForTimeout(3000);

    // Scroll to load more results
    const feed = page.locator('[role="feed"]');
    if (await feed.count()) {
      for (let i = 0; i < 3; i++) {
        await feed.evaluate((el) => el.scrollBy(0, 1000));
        await page.waitForTimeout(1500);
      }
    }

    // Extract business links
    const links = await page.locator('a[href*="/maps/place/"]').all();
    const visitedNames = new Set();

    for (const link of links.slice(0, maxResults * 2)) {
      try {
        const ariaLabel = await link.getAttribute("aria-label");
        if (!ariaLabel || visitedNames.has(ariaLabel)) continue;
        visitedNames.add(ariaLabel);

        await link.click();
        await page.waitForTimeout(2000);

        // Extract details from side panel
        const name = ariaLabel;
        const website = await extractText(page, 'a[data-item-id="authority"]');
        const phone = await extractText(page, '[data-item-id^="phone:"]');

        if (name) {
          const lead = {
            id: generateId(),
            name: name,
            website: website || "",
            email: "", // Will be enriched later
            phone: phone || "",
            source: "google_maps",
            query: query,
            location: location,
            status: "new",
            createdAt: new Date().toISOString(),
            audit: null,
            outreachSent: false,
            followupCount: 0,
          };
          leads.push(lead);
          if (leads.length >= maxResults) break;
        }
      } catch (e) {
        // Skip this result and continue
      }
    }
  } catch (error) {
    log("LeadFinder", `Error: ${error.message}`);
  } finally {
    await browser.close();
  }

  log("LeadFinder", `Found ${leads.length} leads`);
  return leads;
}

/**
 * Search Google for businesses
 */
async function searchGoogle({ query, maxResults = 10 }) {
  const { chromium } = require("playwright");
  log("LeadFinder", `Searching Google: "${query}"`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const leads = [];

  try {
    await page.goto(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      { waitUntil: "networkidle", timeout: 30000 }
    );

    const results = await page.locator("#search .g").all();

    for (const result of results.slice(0, maxResults)) {
      try {
        const titleEl = result.locator("h3").first();
        const linkEl = result.locator("a").first();
        const snippetEl = result.locator('[data-sncf]').first();

        const title = await titleEl.textContent().catch(() => "");
        const href = await linkEl.getAttribute("href").catch(() => "");
        const snippet = await snippetEl.textContent().catch(() => "");

        if (title && href && !href.includes("google.com")) {
          leads.push({
            id: generateId(),
            name: title,
            website: href,
            email: "",
            phone: "",
            source: "google_search",
            query: query,
            location: "",
            status: "new",
            createdAt: new Date().toISOString(),
            description: snippet,
            audit: null,
            outreachSent: false,
            followupCount: 0,
          });
        }
      } catch (e) {
        // Skip
      }
    }
  } catch (error) {
    log("LeadFinder", `Error: ${error.message}`);
  } finally {
    await browser.close();
  }

  log("LeadFinder", `Found ${leads.length} leads from Google`);
  return leads;
}

/**
 * Extract email from a website
 */
async function extractEmailFromSite(url) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    const content = await page.content();

    // Find email patterns
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = content.match(emailRegex) || [];

    // Filter out common non-business emails
    const filtered = emails.filter(
      (e) =>
        !e.includes("example.com") &&
        !e.includes("wixpress") &&
        !e.includes("sentry") &&
        !e.includes("schema.org")
    );

    return filtered[0] || "";
  } catch (e) {
    return "";
  } finally {
    await browser.close();
  }
}

/**
 * Enrich leads with email addresses
 */
async function enrichLeads(leads) {
  log("LeadFinder", `Enriching ${leads.length} leads with emails`);

  for (const lead of leads) {
    if (!lead.email && lead.website) {
      lead.email = await extractEmailFromSite(lead.website);
      // Small delay between requests
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return leads;
}

/**
 * Save leads to data store
 */
function saveLeads(leads) {
  let saved = 0;
  for (const lead of leads) {
    const result = addLead(lead);
    if (result) saved++;
  }
  log("LeadFinder", `Saved ${saved} new leads (${leads.length - saved} duplicates skipped)`);
  return saved;
}

// Helper
async function extractText(page, selector) {
  try {
    const el = page.locator(selector).first();
    if (await el.count()) {
      return await el.textContent();
    }
  } catch (e) {}
  return "";
}

module.exports = {
  searchGoogleMaps,
  searchGoogle,
  extractEmailFromSite,
  enrichLeads,
  saveLeads,
};
