import { createContext, useContext } from "react";
import type {
  AgentId,
  AgentMessage,
  BrandId,
  BrandProfile,
  ContentAsset,
  Activity,
  Company,
  ContentDatabaseEntry,
  ContentTask,
  CreativeBrief,
  CalendarSlot,
  Deal,
  GrowthInsight,
  GrowthMetric,
  KnowledgeItem,
  Lead,
  PerformanceEvent,
  Platform,
  PlatformPlan,
  Topic,
  TopicStatus,
  Weekday,
} from "./types";

export interface Store {
  knowledge: KnowledgeItem[];
  topics: Topic[];
  allTopics: Topic[];
  content: ContentAsset[];
  events: PerformanceEvent[];
  brands: BrandProfile[];
  platformPlans: PlatformPlan[];
  growthMetrics: GrowthMetric[];
  growthInsights: GrowthInsight[];
  creativeBriefs: CreativeBrief[];
  databaseEntries: ContentDatabaseEntry[];
  calendarSlots: CalendarSlot[];
  contentTasks: ContentTask[];
  companies: Company[];
  leads: Lead[];
  deals: Deal[];
  activities: Activity[];
  agentMessages: Record<AgentId, AgentMessage[]>;
  brandFilter: "All" | BrandId;
  setBrandFilter: (b: "All" | BrandId) => void;
  activeContentId: string | null;
  setActiveContentId: (id: string | null) => void;
  weekKey: string;
  addKnowledge: (
    item: Omit<KnowledgeItem, "knowledge_id" | "status" | "last_reviewed_at" | "evidence_score" | "risk_flags"> & {
      evidence_score?: number;
      risk_flags?: string[];
    }
  ) => void;
  updateKnowledge: (id: string, patch: Partial<KnowledgeItem>) => void;
  scientistIngest: (input: {
    title: string;
    summary: string;
    tags: string;
    claims: string;
  }) => KnowledgeItem;
  scientistScoreTopic: (topicId: string) => Topic | null;
  creativeBriefFromTopic: (topicId: string, brand?: BrandId) => CreativeBrief | null;
  creativeGeneratePlatforms: (topicId: string, platforms: Platform[]) => ContentAsset[];
  growthRefreshInsights: () => GrowthInsight[];
  growthAllocateWeek: () => GrowthInsight;
  sendAgentMessage: (agent: AgentId, text: string) => void;
  generateTopics: (input: {
    objective: string;
    brand: BrandId | "All";
    platforms: Platform[];
    scope: string[];
    audience: string;
  }) => Topic[];
  setTopicStatus: (id: string, status: TopicStatus) => void;
  generateContent: (topicId: string, platforms: Platform[]) => ContentAsset[];
  updateContent: (id: string, patch: Partial<ContentAsset>) => void;
  publishContent: (id: string, url: string, campaign?: string) => void;
  addDatabaseEntry: (
    entry: Omit<ContentDatabaseEntry, "id" | "created_at" | "updated_at"> & {
      id?: string;
    }
  ) => ContentDatabaseEntry;
  updateDatabaseEntry: (
    id: string,
    patch: Partial<ContentDatabaseEntry>
  ) => void;
  deleteDatabaseEntry: (id: string) => void;
  scheduleEntry: (
    entryId: string,
    day: Weekday,
    time: string
  ) => CalendarSlot | null;
  unscheduleEntry: (entryId: string) => void;
  moveCalendarSlot: (slotId: string, day: Weekday, time: string) => void;
  submitTaskForReview: (taskId: string) => void;
  approveTask: (taskId: string, notes?: string) => void;
  rejectTask: (taskId: string, notes: string) => void;
  publishApprovedTask: (taskId: string, url: string) => void;
  createOutreachDraft: (leadId: string) => Activity | null;
  updateDeal: (dealId: string, patch: Partial<Deal>) => void;
  createDeal: (input?: Partial<Deal>) => Deal;
  deleteDeal: (dealId: string) => void;
  /** Persistence */
  saveStatus: "idle" | "loading" | "dirty" | "saving" | "saved" | "error" | "offline";
  lastSavedAt: string | null;
  backendOnline: boolean;
  storageBackend: string | null;
  saveNow: () => Promise<boolean>;
}

export const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
