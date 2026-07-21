export type KnowledgeType = "research" | "product" | "brand" | "founder";
export type BrandId =
  | "CEO"
  | "CMO"
  | "Genpulse"
  | "Lushair"
  | "Glamskin"
  | "Finegyno"
  | "Dental";
export type BrandScope = BrandId | "universal";
export type EvidenceLevel = "high" | "medium" | "low" | "narrative";
export type TopicStatus =
  | "backlog"
  | "selected"
  | "produced"
  | "published"
  | "archived";
export type Platform =
  | "TikTok"
  | "Instagram"
  | "X"
  | "LinkedIn"
  | "Pinterest"
  | "Newsletter";
export type ContentType =
  | "video"
  | "carousel"
  | "thread"
  | "post"
  | "pin"
  | "newsletter";
export type ContentStatus = "draft" | "approved" | "published" | "archived";
export type EventType =
  | "impression"
  | "click"
  | "install"
  | "signup"
  | "activation"
  | "upload"
  | "scan"
  | "device_sale";
export type Funnel = "TOFU" | "MOFU" | "BOFU";
export type AgentId = "scientist" | "creative" | "growth";

export interface BrandProfile {
  id: BrandId;
  platforms: Platform[];
  audience: string;
  tone: string;
  goal: string;
  kpi: string;
  cta: string;
  secondary_cta: string;
  prompt_beginning: string;
}

export interface PlatformPlan {
  id: string;
  platform: Platform;
  account: BrandId;
  objective: string;
  cta: string;
  frequency: string;
  /** Normalized posts/pins per week from Platform Strategy */
  weekly_target: number;
}

export interface KnowledgeItem {
  knowledge_id: string;
  title: string;
  type: KnowledgeType;
  brand: BrandScope;
  topic_tags: string[];
  summary: string;
  key_claims: string[];
  evidence_level: EvidenceLevel;
  evidence_score: number;
  controversy?: string;
  risk_flags: string[];
  content_language?: string;
  source_url?: string;
  usable_formats: Platform[];
  audience_tags: string[];
  safety_notes?: string;
  status: "active" | "archived";
  last_reviewed_at?: string;
}

export interface Topic {
  topic_id: string;
  title: string;
  core_angle: string;
  objective: string;
  brand: BrandId;
  platform: Platform[];
  audience: string;
  source_knowledge_ids: string[];
  evidence_level: EvidenceLevel;
  evidence_score: number;
  format_hint: string;
  hook_candidates: string[];
  cta_type: string;
  pillar?: string;
  funnel?: Funnel;
  priority_score: number;
  status: TopicStatus;
  week_key: string;
}

export interface ContentAsset {
  content_id: string;
  topic_id: string;
  brand: BrandId;
  platform: Platform;
  content_type: ContentType;
  title: string;
  script_or_copy: Record<string, unknown>;
  hook: string;
  cta: string;
  source_knowledge_ids: string[];
  tracking_params: Record<string, string>;
  status: ContentStatus;
  creative_direction?: string;
  visual_notes?: string;
  publish_url?: string;
  published_at?: string;
}

export interface PerformanceEvent {
  event_id: string;
  content_id: string;
  topic_id: string;
  brand: BrandId;
  platform: Platform;
  event_type: EventType;
  value: number;
  event_date: string;
  campaign_tag?: string;
}

export interface GrowthMetric {
  brand: BrandId | "All";
  metric: string;
  value: number;
  unit?: string;
}

export interface GrowthInsight {
  id: string;
  type: "trend" | "anomaly" | "recommendation" | "allocation";
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  brand?: BrandId;
  metric?: string;
}

export interface CreativeBrief {
  id: string;
  topic_id: string;
  brand: BrandId;
  format: string;
  angle: string;
  visual_language: string;
  platform_plays: Partial<Record<Platform, string>>;
  created_at: string;
}

export interface AgentMessage {
  id: string;
  agent: AgentId;
  role: "user" | "agent";
  text: string;
  created_at: string;
  payload?: Record<string, unknown>;
}

export const PLATFORM_TYPE: Partial<Record<Platform, ContentType>> = {
  TikTok: "video",
  Instagram: "carousel",
  X: "thread",
  LinkedIn: "post",
  Pinterest: "pin",
  Newsletter: "newsletter",
};

export const TRACKING_BASE = "https://genpulse.app/download";

export type DatabaseStatus =
  | "idea"
  | "briefed"
  | "scripted"
  | "ready"
  | "scheduled"
  | "published"
  | "archived";

export type Weekday =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

/** Matches Growth OS v2 Content Database columns */
export interface ContentDatabaseEntry {
  id: string;
  topic: string;
  ai_prompt: string;
  hook: string;
  script: string;
  caption: string;
  thumbnail_copy: string;
  hashtags: string;
  brand: BrandId;
  platform: Platform;
  objective: string;
  funnel: Funnel;
  target_audience: string;
  cta: string;
  broll: string;
  pillar: string;
  repurpose_matrix: string;
  status: DatabaseStatus;
  kpi: string;
  example: string;
  scheduled_day?: Weekday;
  scheduled_slot?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarSlot {
  slot_id: string;
  entry_id: string;
  day: Weekday;
  time: string;
  brand: BrandId;
  platform: Platform;
  title: string;
  status: DatabaseStatus;
  cta: string;
}

/** @deprecated use BrandId */
export type BrandIp = BrandId;


export type ContentTaskStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected"
  | "scheduled"
  | "published"
  | "archived";

export type IcpType =
  | "pharma_rd"
  | "cosmetics_brand"
  | "indie_brand"
  | "salon_clinic";

export type LeadStatus =
  | "new"
  | "enriched"
  | "scored"
  | "routed"
  | "contacted"
  | "replied"
  | "qualified"
  | "disqualified";

/** Sales Tracking sheet: Deal - Status */
export type DealStatus = "Open" | "Lost" | "Won";

/** Sales Tracking sheet: Deal - Stage */
export type DealStage =
  | "Lead"
  | "Qualified"
  | "Demo"
  | "Discovery"
  | "Proposal"
  | "Negotiations";

export type DealContactOn =
  | "Wechat"
  | "Email"
  | "Whatsapp"
  | "LinkedIn"
  | "Phone";

export type DealChannel =
  | "Website"
  | "Referral"
  | "Ins"
  | "Amazon"
  | "Whatsapp"
  | "Offline Campaign"
  | "API Usage"
  | string;

export interface ContentTask {
  task_id: string;
  brand_id: BrandId;
  channel: Platform;
  topic: string;
  status: ContentTaskStatus;
  health_claim_flag: boolean;
  health_claim_detail?: string;
  draft_content: Record<string, unknown>;
  brand_tone_score?: number;
  database_entry_id?: string;
  scheduled_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  published_at?: string;
  publish_url?: string;
  created_at: string;
}

export interface Company {
  company_id: string;
  name: string;
  industry: string;
  size_band: string;
  icp_type: IcpType;
  website?: string;
  notes?: string;
}

export interface Lead {
  lead_id: string;
  company_id: string;
  full_name: string;
  title: string;
  email: string;
  icp_type: IcpType;
  source_channel: string;
  score: number;
  status: LeadStatus;
  research_summary: string;
}

/** Mirrors Sales Tracking spreadsheet columns (deal-centric CRM). */
export interface Deal {
  deal_id: string;
  title: string;
  organization: string;
  contact_person?: string | null;
  contact_on?: DealContactOn | string | null;
  owner: string;
  status: DealStatus;
  stage: DealStage;
  label?: string | null;
  channel?: DealChannel | null;
  product_name?: string | null;
  product_quantity?: number | null;
  product_amount?: number | null;
  amount: number;
  currency: string;
  lost_reason?: string | null;
  closed_on?: string | null;
  /** Optional link back to content attribution (SAOS Phase 1+) */
  content_attribution_id?: string;
}

export interface Activity {
  activity_id: string;
  lead_id?: string;
  deal_id?: string;
  type: "email" | "call" | "meeting" | "note" | "outreach_draft";
  content: string;
  created_by: "agent" | "human";
  created_at: string;
}
