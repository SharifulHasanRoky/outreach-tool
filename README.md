# AI Outreach Tool

**Automated client acquisition system** — finds businesses, audits their websites, sends personalized outreach, follows up automatically, and tracks everything in a dashboard.

Built with **free tools**, lightweight, and runs on **GitHub Actions**.

---

## How It Works

```
Find Leads → Audit Website → Generate Message → Send Outreach → Follow Up → Track in CRM
```

| Step | What It Does | Tool |
|------|-------------|------|
| 1. Find Leads | Scrapes Google Maps & Search for businesses | Playwright |
| 2. Audit Website | Checks speed, SEO, CTAs, mobile-friendliness | PageSpeed API |
| 3. Generate Outreach | Creates personalized emails based on audit | Groq AI (free) |
| 4. Send Outreach | Emails leads with random delays | NodeMailer |
| 5. Follow Up | Day 2, 5, 10 auto follow-ups | Cron / GitHub Actions |
| 6. Track Leads | CRM dashboard + Google Sheets sync | Next.js + Sheets API |
| 7. AI Reply Assist | Analyzes replies, suggests responses | Groq AI |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/outreach-tool.git
cd outreach-tool
npm install
npx playwright install chromium
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:

| Variable | Required | How to Get |
|----------|----------|-----------|
| `GROQ_API_KEY` | Yes | Free at [console.groq.com](https://console.groq.com) |
| `GMAIL_USER` | Yes | Your Gmail address |
| `GMAIL_APP_PASSWORD` | Yes | [Google App Passwords](https://myaccount.google.com/apppasswords) |
| `PAGESPEED_API_KEY` | Optional | [Google Cloud Console](https://console.cloud.google.com) (free tier) |
| `GOOGLE_SHEETS_ID` | Optional | Create a sheet, copy ID from URL |

### 3. Run the Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Usage

### Run Individual Scripts

```bash
# Find leads for a specific niche + location
npm run lead:find -- "dentist" "Chicago"

# Audit websites of found leads
npm run lead:audit

# Generate and send outreach emails
npm run lead:outreach

# Process follow-ups
npm run lead:followup

# Run the full daily pipeline
npm run lead:daily -- "restaurant" "Miami"
```

### Automated Daily Runs (GitHub Actions)

The system runs automatically every day at 9:00 AM UTC via GitHub Actions.

To set up:
1. Go to your repo → Settings → Secrets → Actions
2. Add these secrets:
   - `GROQ_API_KEY`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `PAGESPEED_API_KEY` (optional)

3. You can also trigger manually: Actions → "Daily AI Outreach Pipeline" → Run workflow

---

## Project Structure

```
outreach-tool/
├── app/                    # Next.js dashboard
│   ├── page.js             # Main dashboard page
│   ├── layout.js           # App layout
│   ├── globals.css         # Tailwind styles
│   └── api/                # API routes
│       ├── leads/          # Lead CRUD
│       ├── stats/          # Dashboard stats
│       └── reply-assist/   # AI reply assistant
├── components/             # React components
│   ├── StatsCards.js       # Stats overview cards
│   ├── LeadTable.js        # Lead management table
│   └── ReplyPanel.js       # AI reply assistant panel
├── modules/                # Core automation modules
│   ├── lead-finder.js      # Scrapes leads from Google
│   ├── website-auditor.js  # Audits websites
│   ├── outreach-generator.js # AI message generation
│   ├── auto-outreach.js    # Email sending
│   ├── followup-engine.js  # Scheduled follow-ups
│   ├── reply-assistant.js  # AI reply suggestions
│   └── crm-sheets.js      # Google Sheets sync
├── lib/                    # Shared utilities
│   ├── ai.js              # AI provider (Groq/OpenAI)
│   ├── config.js          # Central configuration
│   ├── data-store.js      # JSON data storage
│   └── utils.js           # Helper functions
├── scripts/                # CLI automation scripts
│   ├── find-leads.js      # Find new leads
│   ├── audit-websites.js  # Audit lead websites
│   ├── send-outreach.js   # Send outreach emails
│   ├── follow-up.js       # Process follow-ups
│   └── daily-pipeline.js  # Full daily pipeline
├── data/                   # Local data (gitignored)
├── .github/workflows/      # GitHub Actions automation
└── .env.example           # Environment template
```

---

## Dashboard

The dashboard shows:
- **Total Leads** — all leads found
- **Outreach Sent** — emails sent
- **Replies** — leads who replied
- **Interested** — leads showing interest
- **Meetings Booked** — calls scheduled
- **Closed Clients** — deals won

Features:
- View all leads with status
- Click a lead to see audit details
- Update lead status (dropdown)
- AI Reply Assistant — paste a reply, get a suggested response

---

## Follow-up Schedule

| Day | Type | Description |
|-----|------|-------------|
| Day 2 | Reminder | Friendly nudge |
| Day 5 | Value | Share a useful tip |
| Day 10 | Final | Graceful goodbye |

AI generates slightly different messages each time to avoid sounding robotic.

---

## Anti-Spam Safety

- Random delays (30-90s) between emails
- Daily limit (default: 10 leads/day)
- Personalized messages (not templates)
- Human-sounding language
- Respects "not interested" replies
- Stops after 3 follow-ups

---

## Free Tools Used

| Tool | Purpose | Cost |
|------|---------|------|
| Groq | AI text generation | Free tier |
| Gmail + NodeMailer | Email sending | Free |
| Playwright | Browser automation | Free |
| PageSpeed API | Website auditing | Free tier |
| Google Sheets | CRM/tracking | Free |
| GitHub Actions | Daily automation | Free (2000 min/month) |
| Next.js + Tailwind | Dashboard | Free |

---

## Tips

- Start with a small niche (e.g., "dentists in Austin")
- Keep daily limits low (5-10) when starting
- Personalize your from-name in Gmail
- Review AI messages before enabling auto-send
- Monitor your Gmail sender reputation
- Use a dedicated Gmail for outreach (not your personal)

---

## License

MIT — use freely, modify as needed.
