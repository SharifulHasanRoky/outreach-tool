/**
 * Initial demo data for the AI Outreach Tool
 * This seeds the dashboard with sample leads on first load
 */

export const INITIAL_LEADS = [
  {
    id: "lead-001",
    name: "Sunrise Dental Clinic",
    website: "https://sunrisedental.example.com",
    email: "info@sunrisedental.example.com",
    phone: "+1-312-555-0101",
    source: "google_maps",
    query: "dentist",
    location: "Chicago",
    status: "outreach_sent",
    createdAt: "2026-05-20T10:00:00.000Z",
    outreachSent: true,
    outreachDate: "2026-05-21",
    followupCount: 1,
    audit: {
      score: 35,
      summary: "Website is slow, no clear CTA, missing trust signals and lead capture form.",
      issues: ["Website is slow (performance score below 50)", "No clear Call-to-Action (CTA) found", "No lead capture form found", "Missing trust signals (testimonials, reviews, badges)"]
    }
  },
  {
    id: "lead-002",
    name: "Fresh Bites Restaurant",
    website: "https://freshbites.example.com",
    email: "hello@freshbites.example.com",
    phone: "+1-312-555-0202",
    source: "google_maps",
    query: "restaurant",
    location: "Chicago",
    status: "replied",
    createdAt: "2026-05-18T14:30:00.000Z",
    outreachSent: true,
    outreachDate: "2026-05-19",
    followupCount: 0,
    audit: {
      score: 48,
      summary: "No Meta Pixel, weak landing page, no online ordering CTA visible.",
      issues: ["No Meta Pixel or Google Analytics detected", "No clear Call-to-Action (CTA) found", "No social media links found"]
    }
  },
  {
    id: "lead-003",
    name: "PowerFit Gym",
    website: "https://powerfitgym.example.com",
    email: "contact@powerfitgym.example.com",
    phone: "+1-312-555-0303",
    source: "google_search",
    query: "gym",
    location: "Chicago",
    status: "interested",
    createdAt: "2026-05-15T09:00:00.000Z",
    outreachSent: true,
    outreachDate: "2026-05-16",
    followupCount: 2,
    audit: {
      score: 42,
      summary: "Mobile experience is poor, no lead form, branding is weak.",
      issues: ["Not mobile-friendly", "No lead capture form found", "Missing trust signals (testimonials, reviews, badges)", "SEO score is weak"]
    }
  },
  {
    id: "lead-004",
    name: "Elite Auto Detailing",
    website: "https://eliteauto.example.com",
    email: "book@eliteauto.example.com",
    phone: "+1-312-555-0404",
    source: "google_maps",
    query: "auto detailing",
    location: "Chicago",
    status: "meeting_booked",
    createdAt: "2026-05-10T11:00:00.000Z",
    outreachSent: true,
    outreachDate: "2026-05-11",
    followupCount: 1,
    audit: {
      score: 29,
      summary: "Very slow site, no booking form, no reviews section, weak branding.",
      issues: ["Website is slow (performance score below 50)", "Largest Contentful Paint is too slow (>4s)", "No lead capture form found", "Missing trust signals (testimonials, reviews, badges)", "No Meta Pixel or Google Analytics detected"]
    }
  },
  {
    id: "lead-005",
    name: "Bloom Flower Shop",
    website: "https://bloomflowers.example.com",
    email: "orders@bloomflowers.example.com",
    phone: "+1-312-555-0505",
    source: "google_maps",
    query: "flower shop",
    location: "Chicago",
    status: "new",
    createdAt: "2026-05-25T08:00:00.000Z",
    outreachSent: false,
    outreachDate: null,
    followupCount: 0,
    audit: {
      score: 55,
      summary: "Decent site but missing lead capture and social proof.",
      issues: ["No lead capture form found", "No social media links found"]
    }
  },
  {
    id: "lead-006",
    name: "TechFix Phone Repair",
    website: "https://techfixrepair.example.com",
    email: "support@techfixrepair.example.com",
    phone: "+1-312-555-0606",
    source: "google_search",
    query: "phone repair",
    location: "Chicago",
    status: "new",
    createdAt: "2026-05-26T16:00:00.000Z",
    outreachSent: false,
    outreachDate: null,
    followupCount: 0,
    audit: null
  },
  {
    id: "lead-007",
    name: "Cozy Cafe & Bakery",
    website: "https://cozycafe.example.com",
    email: "hi@cozycafe.example.com",
    phone: "+1-312-555-0707",
    source: "google_maps",
    query: "cafe",
    location: "Chicago",
    status: "closed",
    createdAt: "2026-05-05T12:00:00.000Z",
    outreachSent: true,
    outreachDate: "2026-05-06",
    followupCount: 2,
    audit: {
      score: 38,
      summary: "No online menu, slow loading, no Google reviews widget.",
      issues: ["Website is slow (performance score below 50)", "No clear Call-to-Action (CTA) found", "Missing trust signals (testimonials, reviews, badges)"]
    }
  },
  {
    id: "lead-008",
    name: "LegalEdge Law Firm",
    website: "https://legaledge.example.com",
    email: "consult@legaledge.example.com",
    phone: "+1-312-555-0808",
    source: "google_search",
    query: "law firm",
    location: "Chicago",
    status: "no_response",
    createdAt: "2026-05-08T09:30:00.000Z",
    outreachSent: true,
    outreachDate: "2026-05-09",
    followupCount: 3,
    audit: {
      score: 61,
      summary: "Decent SEO but no lead form and poor mobile experience.",
      issues: ["Not mobile-friendly", "No lead capture form found"]
    }
  }
];

export const INITIAL_LOGS = [
  {
    id: "out-001",
    leadId: "lead-001",
    leadName: "Sunrise Dental Clinic",
    email: "info@sunrisedental.example.com",
    subject: "Quick idea for Sunrise Dental",
    status: "sent",
    sentAt: "2026-05-21T09:15:00.000Z",
    followupNumber: 0
  },
  {
    id: "out-002",
    leadId: "lead-002",
    leadName: "Fresh Bites Restaurant",
    email: "hello@freshbites.example.com",
    subject: "Thought about Fresh Bites online presence",
    status: "sent",
    sentAt: "2026-05-19T10:30:00.000Z",
    followupNumber: 0
  },
  {
    id: "out-003",
    leadId: "lead-003",
    leadName: "PowerFit Gym",
    email: "contact@powerfitgym.example.com",
    subject: "Quick win for PowerFit Gym website",
    status: "sent",
    sentAt: "2026-05-16T08:45:00.000Z",
    followupNumber: 0
  },
  {
    id: "out-004",
    leadId: "lead-004",
    leadName: "Elite Auto Detailing",
    email: "book@eliteauto.example.com",
    subject: "Idea to get more bookings for Elite Auto",
    status: "sent",
    sentAt: "2026-05-11T11:00:00.000Z",
    followupNumber: 0
  },
  {
    id: "out-005",
    leadId: "lead-007",
    leadName: "Cozy Cafe & Bakery",
    email: "hi@cozycafe.example.com",
    subject: "Quick thought about Cozy Cafe website",
    status: "sent",
    sentAt: "2026-05-06T14:00:00.000Z",
    followupNumber: 0
  },
  {
    id: "out-006",
    leadId: "lead-008",
    leadName: "LegalEdge Law Firm",
    email: "consult@legaledge.example.com",
    subject: "Idea for LegalEdge online leads",
    status: "sent",
    sentAt: "2026-05-09T09:00:00.000Z",
    followupNumber: 0
  },
  {
    id: "out-007",
    leadId: "lead-001",
    leadName: "Sunrise Dental Clinic",
    email: "info@sunrisedental.example.com",
    subject: "Re: Quick idea for Sunrise Dental",
    status: "sent",
    sentAt: "2026-05-23T09:00:00.000Z",
    followupNumber: 1
  }
];
