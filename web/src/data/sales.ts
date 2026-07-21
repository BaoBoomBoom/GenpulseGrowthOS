import type {
  Activity,
  Company,
  ContentTask,
  Deal,
  Lead,
} from "../types";
import { salesTrackingDeals } from "./salesTrackingDeals";

export const contentTaskSeed: ContentTask[] = [
  {
    task_id: "ct-lushair-ig-001",
    brand_id: "Lushair",
    channel: "Instagram",
    topic: "Do peptides work for hair growth?",
    status: "in_review",
    health_claim_flag: true,
    health_claim_detail:
      'Draft uses "regrowth" adjacent language — must soften to mechanism literacy only.',
    draft_content: {
      format: "carousel",
      hook: "Do peptides work?",
      caption:
        "Copper peptides show interesting signals in literature — not a miracle reel. Soft CTA: Hair Scan.",
      slides: ["Cover", "Evidence map", "Hype vs signal", "Hair Scan CTA"],
    },
    brand_tone_score: 78,
    database_entry_id: "GP003",
    created_at: "2026-07-20",
  },
  {
    task_id: "ct-lushair-li-001",
    brand_id: "Lushair",
    channel: "LinkedIn",
    topic: "Hair shed after your period — education post",
    status: "in_review",
    health_claim_flag: false,
    draft_content: {
      format: "post",
      opening: "Post-period shedding often tracks follicle timing — not shampoo betrayal.",
      body: "Educational framing for salon partners and informed consumers.",
      cta: "Hair Scan",
    },
    brand_tone_score: 86,
    database_entry_id: "LH005",
    created_at: "2026-07-21",
  },
  {
    task_id: "ct-ceo-tt-001",
    brand_id: "CEO",
    channel: "TikTok",
    topic: "Losing 5 hairs during lunch",
    status: "draft",
    health_claim_flag: false,
    draft_content: {
      hook: "I lost 5 hairs walking to lunch.",
      script: "Dating analogy + cycle timing + soft download CTA",
    },
    brand_tone_score: 90,
    database_entry_id: "FIO001",
    created_at: "2026-07-19",
  },
];

export const companySeed: Company[] = [
  {
    company_id: "co-salon-aurora",
    name: "Aurora Hair Lab",
    industry: "Salon",
    size_band: "5-20 seats",
    icp_type: "salon_clinic",
    website: "https://example.com/aurora",
    notes: "Looking at scalp imaging + CRM retention.",
  },
  {
    company_id: "co-cosmo-labs",
    name: "CosmoLabs Beauty",
    industry: "Cosmetics brand",
    size_band: "50-200",
    icp_type: "cosmetics_brand",
    website: "https://example.com/cosmolabs",
    notes: "Market team exploring white-label scan hardware.",
  },
  {
    company_id: "co-pharma-helix",
    name: "Helix Derm R&D",
    industry: "Pharma R&D",
    size_band: "200+",
    icp_type: "pharma_rd",
    notes: "Needs API subscription for dermatology signals research.",
  },
];

export const leadSeed: Lead[] = [
  {
    lead_id: "ld-maya",
    company_id: "co-salon-aurora",
    full_name: "Maya Chen",
    title: "Owner / Creative Director",
    email: "maya@aurora-example.com",
    icp_type: "salon_clinic",
    source_channel: "LinkedIn / Lushair education post",
    score: 82,
    status: "scored",
    research_summary:
      "Salon already uses booking SaaS; no imaging device. Strong fit for SaaS+hardware subscription.",
  },
  {
    lead_id: "ld-jonas",
    company_id: "co-cosmo-labs",
    full_name: "Jonas Reed",
    title: "Head of Marketing Tech",
    email: "jonas@cosmolabs-example.com",
    icp_type: "cosmetics_brand",
    source_channel: "AAD attendee list",
    score: 74,
    status: "enriched",
    research_summary:
      "Hiring for 'retail diagnostics'. Evaluating white-label hardware partners.",
  },
  {
    lead_id: "ld-priya",
    company_id: "co-pharma-helix",
    full_name: "Priya Nair",
    title: "Director, Digital Biomarkers",
    email: "priya@helix-example.com",
    icp_type: "pharma_rd",
    source_channel: "Website inquiry",
    score: 91,
    status: "routed",
    research_summary:
      "Needs API access + compliance packet. High score — route to BD.",
  },
];

/** Seeded from Sales Tracking Google Sheet. */
export const dealSeed: Deal[] = salesTrackingDeals;

export const activitySeed: Activity[] = [
  {
    activity_id: "act-1",
    lead_id: "ld-maya",
    type: "outreach_draft",
    content:
      "Subject: Scalp imaging that feeds your salon CRM\n\nHi Maya — noticed Aurora is growing retention programs. Draft only; awaiting human send approval.",
    created_by: "agent",
    created_at: "2026-07-21T10:00:00Z",
  },
  {
    activity_id: "act-2",
    lead_id: "ld-priya",
    type: "note",
    content: "High-score pharma lead routed. Compliance packet required before proposal.",
    created_by: "human",
    created_at: "2026-07-21T11:00:00Z",
  },
];
