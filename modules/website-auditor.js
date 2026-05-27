/**
 * WEBSITE AUDITOR MODULE
 * Analyzes websites for speed, SEO, mobile-friendliness, etc.
 * Uses Google PageSpeed API + custom checks
 */
const config = require("../lib/config");
const { generate } = require("../lib/ai");
const { log } = require("../lib/utils");

/**
 * Run full website audit
 * @param {string} url - Website URL
 * @returns {Promise<object>} Audit results
 */
async function auditWebsite(url) {
  log("Auditor", `Auditing: ${url}`);

  const results = {
    url,
    timestamp: new Date().toISOString(),
    speed: null,
    mobile: null,
    seo: null,
    issues: [],
    score: 0,
    summary: "",
  };

  try {
    // Run PageSpeed analysis
    const pagespeedData = await runPageSpeed(url);
    if (pagespeedData) {
      results.speed = {
        score: pagespeedData.performanceScore,
        fcp: pagespeedData.fcp,
        lcp: pagespeedData.lcp,
        cls: pagespeedData.cls,
        loadTime: pagespeedData.speedIndex,
      };
      results.mobile = {
        friendly: pagespeedData.performanceScore > 50,
        viewport: pagespeedData.hasViewport,
      };
      results.seo = {
        score: pagespeedData.seoScore,
        hasMetaDescription: pagespeedData.hasMetaDescription,
        hasTitle: pagespeedData.hasTitle,
      };
    }

    // Run custom checks
    const customChecks = await runCustomChecks(url);
    results.issues = customChecks.issues;

    // Add PageSpeed issues
    if (results.speed && results.speed.score < 50) {
      results.issues.push("Website is slow (performance score below 50)");
    }
    if (results.speed && results.speed.lcp > 4000) {
      results.issues.push("Largest Contentful Paint is too slow (>4s)");
    }
    if (results.seo && results.seo.score < 70) {
      results.issues.push("SEO score is weak");
    }
    if (results.mobile && !results.mobile.friendly) {
      results.issues.push("Not mobile-friendly");
    }

    // Calculate overall score
    const scores = [
      results.speed?.score || 0,
      results.seo?.score || 0,
      results.mobile?.friendly ? 80 : 30,
    ];
    results.score = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );

    // Generate AI summary
    results.summary = await generateAuditSummary(url, results);
  } catch (error) {
    log("Auditor", `Error auditing ${url}: ${error.message}`);
    results.issues.push("Could not fully audit website");
    results.summary = "Website audit incomplete - site may be unreachable";
  }

  return results;
}

/**
 * Google PageSpeed Insights API
 */
async function runPageSpeed(url) {
  try {
    const apiKey = config.pagespeed.apiKey;
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=mobile${apiKey ? `&key=${apiKey}` : ""}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.lighthouseResult) return null;

    const lighthouse = data.lighthouseResult;
    const categories = lighthouse.categories || {};
    const audits = lighthouse.audits || {};

    return {
      performanceScore: Math.round(
        (categories.performance?.score || 0) * 100
      ),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      fcp: audits["first-contentful-paint"]?.numericValue || 0,
      lcp: audits["largest-contentful-paint"]?.numericValue || 0,
      cls: audits["cumulative-layout-shift"]?.numericValue || 0,
      speedIndex: audits["speed-index"]?.numericValue || 0,
      hasViewport: audits["viewport"]?.score === 1,
      hasMetaDescription: audits["meta-description"]?.score === 1,
      hasTitle: audits["document-title"]?.score === 1,
    };
  } catch (error) {
    log("Auditor", `PageSpeed API error: ${error.message}`);
    return null;
  }
}

/**
 * Custom website checks using Playwright
 */
async function runCustomChecks(url) {
  const { chromium } = require("playwright");
  const issues = [];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Check for CTA
    const ctaSelectors = [
      'a[href*="contact"]',
      'a[href*="book"]',
      'a[href*="schedule"]',
      'button:has-text("Get Started")',
      'button:has-text("Contact")',
      'button:has-text("Book")',
      'a:has-text("Free")',
      ".cta",
      "#cta",
    ];
    let hasCTA = false;
    for (const sel of ctaSelectors) {
      if (await page.locator(sel).count()) {
        hasCTA = true;
        break;
      }
    }
    if (!hasCTA) {
      issues.push("No clear Call-to-Action (CTA) found");
    }

    // Check for lead capture form
    const forms = await page.locator("form").count();
    const emailInputs = await page
      .locator('input[type="email"], input[name*="email"]')
      .count();
    if (forms === 0 && emailInputs === 0) {
      issues.push("No lead capture form found");
    }

    // Check for trust signals
    const trustSelectors = [
      'img[alt*="testimonial"]',
      ".testimonial",
      ".review",
      ".rating",
      'img[alt*="trust"]',
      ".trust-badge",
      'section:has-text("Trusted")',
    ];
    let hasTrust = false;
    for (const sel of trustSelectors) {
      if (await page.locator(sel).count()) {
        hasTrust = true;
        break;
      }
    }
    if (!hasTrust) {
      issues.push("Missing trust signals (testimonials, reviews, badges)");
    }

    // Check for social links
    const socialLinks = await page
      .locator(
        'a[href*="facebook"], a[href*="instagram"], a[href*="linkedin"], a[href*="twitter"]'
      )
      .count();
    if (socialLinks === 0) {
      issues.push("No social media links found");
    }

    // Check for tracking pixel
    const content = await page.content();
    const hasPixel =
      content.includes("fbq(") ||
      content.includes("facebook.com/tr") ||
      content.includes("gtag(") ||
      content.includes("google-analytics");
    if (!hasPixel) {
      issues.push("No Meta Pixel or Google Analytics detected");
    }
  } catch (error) {
    issues.push("Website may be slow or unreachable");
  } finally {
    await browser.close();
  }

  return { issues };
}

/**
 * Generate AI summary of audit findings
 */
async function generateAuditSummary(url, auditResults) {
  const systemPrompt = `You are a website audit expert. Generate a brief, conversational summary of website issues found. Keep it under 3 sentences. Be specific about problems. Do not use technical jargon.`;

  const userPrompt = `Website: ${url}
Performance Score: ${auditResults.speed?.score || "N/A"}/100
SEO Score: ${auditResults.seo?.score || "N/A"}/100
Issues found:
${auditResults.issues.map((i) => `- ${i}`).join("\n")}

Generate a brief audit summary.`;

  try {
    return await generate(systemPrompt, userPrompt);
  } catch (e) {
    // Fallback if AI is not configured
    return auditResults.issues.length > 0
      ? `Found ${auditResults.issues.length} issues: ${auditResults.issues.slice(0, 3).join(", ")}`
      : "Website appears to be in reasonable shape.";
  }
}

module.exports = { auditWebsite, runPageSpeed, runCustomChecks };
