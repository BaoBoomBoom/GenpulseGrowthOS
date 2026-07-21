import { useMemo, useState, type ReactNode } from "react";
import { brandProfiles, platformPlans } from "./data/brands";
import {
  contentSeed,
  creativeBriefsSeed,
  eventSeed,
  growthInsightsSeed,
  growthMetricsSeed,
  knowledgeSeed,
  topicSeed,
} from "./data/seed";
import { calendarSeed, databaseSeed } from "./data/database";
import {
  activitySeed,
  companySeed,
  contentTaskSeed,
  dealSeed,
  leadSeed,
} from "./data/sales";
import type {
  AgentId,
  AgentMessage,
  BrandId,
  Activity,
  ContentAsset,
  ContentDatabaseEntry,
  CreativeBrief,
  CalendarSlot,
  Deal,
  GrowthInsight,
  KnowledgeItem,
  Platform,
  Topic,
} from "./types";
import { PLATFORM_TYPE, TRACKING_BASE } from "./types";
import { StoreContext, type Store } from "./store-context";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function buildTracking(
  content: Pick<ContentAsset, "content_id" | "topic_id" | "brand" | "platform">,
  ctaType: string,
  campaign = "2026W30"
) {
  return {
    content_id: content.content_id,
    topic_id: content.topic_id,
    brand: content.brand,
    platform: content.platform,
    campaign,
    cta_type: ctaType,
  };
}

export function trackingLink(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  return `${TRACKING_BASE}?${q}`;
}

function generatePlatformCopy(
  topic: Topic,
  platform: Platform,
  knowledge: KnowledgeItem[],
  brandTone: string
): Record<string, unknown> {
  const claims = knowledge.flatMap((k) => k.key_claims).slice(0, 3);
  const hook = topic.hook_candidates[0] || topic.title;
  const contentLang = knowledge.find((k) => k.content_language)?.content_language;

  if (platform === "TikTok") {
    return {
      hook,
      talking_points: claims.length ? claims : [topic.core_angle],
      narrator_notes: `Tone: ${brandTone}. ${contentLang || ""}`.trim(),
      caption: `${topic.title} ù ${topic.cta_type}`,
      on_screen_text: [hook.slice(0, 24), topic.brand, "CTA"],
    };
  }
  if (platform === "Instagram") {
    return {
      cover_headline: topic.title,
      slides: [hook, topic.core_angle, ...claims, `CTA: ${topic.cta_type}`].slice(0, 6),
      caption: topic.core_angle,
      visual_direction_notes: `${topic.brand} visual system`,
    };
  }
  if (platform === "X") {
    return {
      tweets: [hook, topic.core_angle, ...claims, `CTA ? ${topic.cta_type}`].slice(0, 6),
      final_cta: topic.cta_type,
      references_line: knowledge
        .filter((k) => k.type === "research")
        .map((k) => k.title)
        .join(" ù "),
    };
  }
  if (platform === "Pinterest") {
    return {
      headline: topic.title,
      description: topic.core_angle,
      pin_cta: topic.cta_type,
    };
  }
  return {
    opening_insight: hook,
    body: topic.core_angle,
    evidence_section: claims.join(" "),
    conclusion: contentLang || `For ${topic.audience}`,
    cta: topic.cta_type,
  };
}

const TOPIC_BANK: Omit<
  Topic,
  "topic_id" | "status" | "week_key" | "priority_score" | "evidence_score"
>[] = [
  {
    title: "Magnesium vs melatonin ù wrong sleep problem?",
    core_angle: "Compare mechanisms without hype; route to personalization.",
    objective: "app downloads",
    brand: "Genpulse",
    platform: ["TikTok", "X"],
    audience: "sleep-concerned adults 20-40",
    source_knowledge_ids: ["k-melatonin"],
    evidence_level: "medium",
    format_hint: "short video + thread",
    hook_candidates: ["You might be solving the wrong sleep problem"],
    cta_type: "Upload Images",
    pillar: "Longevity",
    funnel: "MOFU",
  },
  {
    title: "Skin gets oily before ovulation",
    core_angle: "Hormone x sebum education for Finegyno / Glamskin crossover.",
    objective: "Sales",
    brand: "Finegyno",
    platform: ["TikTok", "Instagram"],
    audience: "women tracking cycle + skin",
    source_knowledge_ids: ["k-period-hair", "k-hormones-signals"],
    evidence_level: "medium",
    format_hint: "carousel",
    hook_candidates: ["Your oiliness has a calendar"],
    cta_type: "Track Cycle",
    pillar: "Hormones",
    funnel: "TOFU",
  },
  {
    title: "Hair shed after your period ù not shampoo betrayal",
    core_angle: "Cycle-linked telogen timing for Lushair.",
    objective: "Sales",
    brand: "Lushair",
    platform: ["TikTok", "Instagram", "Pinterest"],
    audience: "women noticing cyclical shedding",
    source_knowledge_ids: ["k-hair-cycle", "k-period-hair"],
    evidence_level: "high",
    format_hint: "carousel + pin",
    hook_candidates: ["Post-period shedding has a biological calendar"],
    cta_type: "Hair Scan",
    pillar: "Hair Science",
    funnel: "MOFU",
  },
];

function scoreTopic(
  t: (typeof TOPIC_BANK)[0],
  input: {
    objective: string;
    brand: BrandId | "All";
    platforms: Platform[];
    scope: string[];
  }
) {
  const objective = t.objective.toLowerCase().includes(input.objective.toLowerCase().slice(0, 6))
    ? 90
    : 55;
  const brand = input.brand === "All" || t.brand === input.brand ? 88 : 40;
  const platform =
    t.platform.some((p) => input.platforms.includes(p)) || !input.platforms.length
      ? 85
      : 45;
  let evidence =
    t.evidence_level === "high" ? 90 : t.evidence_level === "medium" ? 70 : 55;
  const blob = [t.title, t.core_angle, ...t.hook_candidates].join(" ").toLowerCase();
  if (input.scope.some((s) => blob.includes(s.toLowerCase()))) {
    evidence = Math.min(100, evidence + 10);
  }
  return objective * 0.3 + brand * 0.2 + platform * 0.15 + evidence * 0.15 + 50 * 0.2;
}

function agentReply(agent: AgentId, userText: string): string {
  const t = userText.toLowerCase();
  if (agent === "scientist") {
    if (t.includes("score") || t.includes("evidence")) {
      return "Evidence gate: I score claims against knowledge, flag controversies, and block uncited science from Creative.";
    }
    if (t.includes("risk") || t.includes("controversy")) {
      return "Risk scan ready. Peptide and supplement topics need medium evidence + explicit risk flags before publish.";
    }
    return "I track scientific updates, extract usable evidence, translate paper language into content language, and assign evidence scores. I do not write captions.";
  }
  if (agent === "creative") {
    if (t.includes("brief") || t.includes("brand")) {
      return "I lock brand personality first, then choose format and platform expression. Same topic, different stage direction per account.";
    }
    return "I am style and expression ù tone, format, visual language, and multi-platform rewrites. Not a caption dump.";
  }
  if (t.includes("allocat") || t.includes("week") || t.includes("next")) {
    return "Next-week allocation should overweight CEO TikTok dating-biology and Genpulse sleep-signal threads ù they complete the download?upload loop.";
  }
  if (t.includes("anomal")) {
    return "Anomaly: Lushair peptide posts get saves but weak Hair Scan CTR. Soften CTA ladder.";
  }
  return "I attribute business outcomes, spot trends/anomalies, and allocate next-week content capacity. Dashboards are inputs ù decisions are the job.";
}

const initialMessages: Record<AgentId, AgentMessage[]> = {
  scientist: [
    {
      id: "m-s0",
      agent: "scientist",
      role: "agent",
      text: "AI Scientist online. I guard truth and credibility ù evidence extraction, controversy/risk flags, content-language translation, evidence scores.",
      created_at: nowIso(),
    },
  ],
  creative: [
    {
      id: "m-c0",
      agent: "creative",
      role: "agent",
      text: "AI Creative Director online. I set brand voice, format, creative direction, and how one theme plays across platforms.",
      created_at: nowIso(),
    },
  ],
  growth: [
    {
      id: "m-g0",
      agent: "growth",
      role: "agent",
      text: "AI Growth Manager online. I attribute, detect anomalies, recommend, and allocate next-week resources against downloads / uploads / scans ù not vanity views.",
      created_at: nowIso(),
    },
  ],
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [knowledge, setKnowledge] = useState(knowledgeSeed);
  const [topics, setTopics] = useState(topicSeed);
  const [content, setContent] = useState(contentSeed);
  const [events] = useState(eventSeed);
  const [growthMetrics] = useState(growthMetricsSeed);
  const [growthInsights, setGrowthInsights] = useState(growthInsightsSeed);
  const [creativeBriefs, setCreativeBriefs] = useState(creativeBriefsSeed);
  const [databaseEntries, setDatabaseEntries] = useState(databaseSeed);
  const [calendarSlots, setCalendarSlots] = useState(calendarSeed);
  const [contentTasks, setContentTasks] = useState(contentTaskSeed);
  const [companies] = useState(companySeed);
  const [leads, setLeads] = useState(leadSeed);
  const [deals, setDeals] = useState(dealSeed);
  const [activities, setActivities] = useState(activitySeed);
  const [agentMessages, setAgentMessages] = useState(initialMessages);
  const [brandFilter, setBrandFilter] = useState<"All" | BrandId>("All");
  const [activeContentId, setActiveContentId] = useState<string | null>(
    "c-sleep-tiktok"
  );
  const weekKey = "2026-W30";

  const value = useMemo<Store>(() => {
    const filteredTopics =
      brandFilter === "All" ? topics : topics.filter((t) => t.brand === brandFilter);
    const topicLookup = topics;

    function pushAgent(agent: AgentId, role: "user" | "agent", text: string, payload?: Record<string, unknown>) {
      setAgentMessages((prev) => ({
        ...prev,
        [agent]: [
          ...prev[agent],
          {
            id: uid("m"),
            agent,
            role,
            text,
            created_at: nowIso(),
            payload,
          },
        ],
      }));
    }

    function makeContent(topic: Topic, platforms: Platform[]) {
      const related = knowledge.filter((k) =>
        topic.source_knowledge_ids.includes(k.knowledge_id)
      );
      const brand = brandProfiles.find((b) => b.id === topic.brand);
      const created: ContentAsset[] = platforms.map((platform) => {
        const content_id = uid("c");
        return {
          content_id,
          topic_id: topic.topic_id,
          brand: topic.brand,
          platform,
          content_type: PLATFORM_TYPE[platform] || "post",
          title: `${topic.title.slice(0, 28)} | ${platform}`,
          script_or_copy: generatePlatformCopy(
            topic,
            platform,
            related,
            brand?.tone || topic.brand
          ),
          hook: topic.hook_candidates[0] || topic.title,
          cta: topic.cta_type,
          source_knowledge_ids: topic.source_knowledge_ids,
          tracking_params: buildTracking(
            {
              content_id,
              topic_id: topic.topic_id,
              brand: topic.brand,
              platform,
            },
            topic.cta_type
          ),
          status: "draft" as const,
          creative_direction: brand
            ? `${brand.tone} ù format ${topic.format_hint}`
            : topic.format_hint,
          visual_notes: brand?.prompt_beginning.slice(0, 120),
        };
      });
      setContent((prev) => {
        const without = prev.filter(
          (c) =>
            !(
              c.topic_id === topic.topic_id &&
              platforms.includes(c.platform) &&
              c.status !== "archived"
            )
        );
        return [...created, ...without];
      });
      setActiveContentId(created[0]?.content_id ?? null);
      return created;
    }

    return {
      knowledge,
      topics: filteredTopics,
      allTopics: topics,
      content,
      events,
      brands: brandProfiles,
      platformPlans,
      growthMetrics,
      growthInsights,
      creativeBriefs,
      databaseEntries,
      calendarSlots,
      contentTasks,
      companies,
      leads,
      deals,
      activities,
      agentMessages,
      brandFilter,
      setBrandFilter,
      activeContentId,
      setActiveContentId,
      weekKey,
      addKnowledge(item) {
        setKnowledge((prev) => [
          {
            ...item,
            knowledge_id: uid("k"),
            evidence_score: item.evidence_score ?? 55,
            risk_flags: item.risk_flags ?? [],
            status: "active",
            last_reviewed_at: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ]);
      },
      updateKnowledge(id, patch) {
        setKnowledge((prev) =>
          prev.map((k) => (k.knowledge_id === id ? { ...k, ...patch } : k))
        );
      },
      scientistIngest(input) {
        const tags = input.tags.split(",").map((s) => s.trim()).filter(Boolean);
        const claims = input.claims.split("\n").map((s) => s.trim()).filter(Boolean);
        const score = Math.min(
          95,
          50 + claims.length * 8 + (input.summary.length > 80 ? 10 : 0)
        );
        const level =
          score >= 80 ? "high" : score >= 60 ? "medium" : ("low" as const);
        const item: KnowledgeItem = {
          knowledge_id: uid("k"),
          title: input.title.trim(),
          type: "research",
          brand: "universal",
          topic_tags: tags.length ? tags : ["unsorted"],
          summary: input.summary.trim(),
          key_claims: claims,
          evidence_level: level,
          evidence_score: score,
          controversy:
            score < 70
              ? "Evidence base incomplete ù treat claims as provisional."
              : undefined,
          risk_flags:
            score < 75
              ? ["Needs human scientific review before hard claims"]
              : ["Keep non-diagnostic framing"],
          content_language: `Plain-language takeaway: ${claims[0] || input.summary.slice(0, 100)}`,
          usable_formats: ["TikTok", "Instagram", "X", "LinkedIn"],
          audience_tags: [],
          status: "active",
          last_reviewed_at: new Date().toISOString().slice(0, 10),
        };
        setKnowledge((prev) => [item, ...prev]);
        pushAgent(
          "scientist",
          "agent",
          `Ingested "${item.title}". Evidence score ${item.evidence_score} (${item.evidence_level}). Controversies/risks attached. Content language drafted.`,
          { knowledge_id: item.knowledge_id, evidence_score: item.evidence_score }
        );
        return item;
      },
      scientistScoreTopic(topicId) {
        const topic = topicLookup.find((t) => t.topic_id === topicId);
        if (!topic) return null;
        const related = knowledge.filter((k) =>
          topic.source_knowledge_ids.includes(k.knowledge_id)
        );
        const avg =
          related.length === 0
            ? 40
            : related.reduce((s, k) => s + k.evidence_score, 0) / related.length;
        const risks = related.flatMap((k) => k.risk_flags);
        const updated = {
          ...topic,
          evidence_score: Number(avg.toFixed(0)),
          evidence_level:
            avg >= 80 ? ("high" as const) : avg >= 60 ? ("medium" as const) : ("low" as const),
        };
        setTopics((prev) =>
          prev.map((t) => (t.topic_id === topicId ? updated : t))
        );
        pushAgent(
          "scientist",
          "agent",
          `Scored topic "${topic.title}" ? evidence ${updated.evidence_score}. Risks: ${
            risks.slice(0, 2).join("; ") || "none flagged"
          }.`,
          { topic_id: topicId, evidence_score: updated.evidence_score }
        );
        return updated;
      },
      creativeBriefFromTopic(topicId, brand) {
        const topic = topicLookup.find((t) => t.topic_id === topicId);
        if (!topic) return null;
        const b = brandProfiles.find((x) => x.id === (brand || topic.brand));
        if (!b) return null;
        const brief: CreativeBrief = {
          id: uid("cb"),
          topic_id: topic.topic_id,
          brand: b.id,
          format: topic.format_hint || "short video",
          angle: topic.core_angle,
          visual_language: `${b.tone} ù ${b.prompt_beginning.slice(0, 80)}`,
          platform_plays: Object.fromEntries(
            topic.platform.map((p) => [
              p,
              p === "TikTok"
                ? "Hook-first ù 3 beats ù soft CTA"
                : p === "Instagram"
                  ? "Cover headline ù 5-6 slides ù aesthetic lock"
                  : p === "X"
                    ? "Thread ladder ù evidence line ù CTA"
                    : p === "LinkedIn"
                      ? "Insight open ù structured body ù founder close"
                      : `${p} native expression`,
            ])
          ),
          created_at: new Date().toISOString().slice(0, 10),
        };
        setCreativeBriefs((prev) => [brief, ...prev]);
        pushAgent(
          "creative",
          "agent",
          `Brief locked for ${b.id}: format=${brief.format}. Platform plays drafted for ${topic.platform.join(", ")}.`,
          { brief_id: brief.id }
        );
        return brief;
      },
      creativeGeneratePlatforms(topicId, platforms) {
        const topic = topicLookup.find((t) => t.topic_id === topicId);
        if (!topic) return [];
        const created = makeContent(topic, platforms);
        setTopics((prev) =>
          prev.map((t) =>
            t.topic_id === topicId
              ? {
                  ...t,
                  status:
                    t.status === "backlog" || t.status === "selected"
                      ? "produced"
                      : t.status,
                }
              : t
          )
        );
        pushAgent(
          "creative",
          "agent",
          `Generated ${created.length} platform versions for "${topic.title}" with brand tone locked.`,
          { content_ids: created.map((c) => c.content_id) }
        );
        return created;
      },
      growthRefreshInsights() {
        const installs = events
          .filter((e) => e.event_type === "install")
          .reduce((s, e) => s + e.value, 0);
        const uploads = events
          .filter((e) => e.event_type === "upload")
          .reduce((s, e) => s + e.value, 0);
        const next: GrowthInsight[] = [
          {
            id: uid("gi"),
            type: "trend",
            title: `Funnel pulse: ${installs} downloads ? ${uploads} uploads`,
            detail:
              "Content that completes install?activation?upload should receive priority_score uplift next week.",
            impact: "high",
            metric: "upload",
          },
          ...growthInsightsSeed,
        ];
        setGrowthInsights(next);
        pushAgent(
          "growth",
          "agent",
          `Refreshed insights. Business-linked wins: ${installs} downloads, ${uploads} uploads this sample window.`,
          { installs, uploads }
        );
        return next;
      },
      growthAllocateWeek() {
        const allocation: GrowthInsight = {
          id: uid("gi"),
          type: "allocation",
          title: `W31 allocation plan`,
          detail:
            "CEO TikTok x6 (dating-biology) ù Genpulse X/TikTok x8 (sleep signals + upload CTA) ù Lushair IG/TT x5 (cycle-shed education ? Hair Scan) ù Finegyno TT x4 ù pause Dental until voice pack QA.",
          impact: "high",
        };
        setGrowthInsights((prev) => [allocation, ...prev]);
        // bump winning topics
        setTopics((prev) =>
          prev.map((t) =>
            t.topic_id === "t-sleep-willpower" || t.topic_id === "t-fio001"
              ? {
                  ...t,
                  priority_score: Math.min(99, t.priority_score + 4),
                }
              : t
          )
        );
        pushAgent("growth", "agent", allocation.detail, { allocation: true });
        return allocation;
      },
      sendAgentMessage(agent, text) {
        pushAgent(agent, "user", text);
        const reply = agentReply(agent, text);
        setTimeout(() => {
          pushAgent(agent, "agent", reply);
        }, 0);
        // also run lightweight actions
        if (agent === "scientist" && text.toLowerCase().includes("score")) {
          const first = topicLookup[0];
          if (first) {
            // scored via message only; UI buttons call scientistScoreTopic
          }
        }
      },
      generateTopics(input) {
        const generated: Topic[] = TOPIC_BANK.map((base) => {
          const priority = Number(scoreTopic(base, input).toFixed(2));
          return {
            ...base,
            topic_id: uid("t"),
            objective: input.objective || base.objective,
            brand: input.brand === "All" ? base.brand : input.brand,
            platform: input.platforms.length ? input.platforms : base.platform,
            audience: input.audience || base.audience,
            evidence_score:
              base.evidence_level === "high"
                ? 85
                : base.evidence_level === "medium"
                  ? 68
                  : 50,
            priority_score: priority,
            status: "backlog" as const,
            week_key: weekKey,
          };
        }).sort((a, b) => b.priority_score - a.priority_score);
        setTopics((prev) => [...generated, ...prev]);
        return generated;
      },
      setTopicStatus(id, status) {
        setTopics((prev) =>
          prev.map((t) => (t.topic_id === id ? { ...t, status } : t))
        );
      },
      generateContent(topicId, platforms) {
        const topic = topicLookup.find((t) => t.topic_id === topicId);
        if (!topic) return [];
        return makeContent(topic, platforms);
      },
      updateContent(id, patch) {
        setContent((prev) =>
          prev.map((c) => (c.content_id === id ? { ...c, ...patch } : c))
        );
      },
      publishContent(id, url, campaign) {
        let topicId: string | null = null;
        setContent((prev) =>
          prev.map((c) => {
            if (c.content_id !== id) return c;
            topicId = c.topic_id;
            return {
              ...c,
              status: "published" as const,
              publish_url: url,
              published_at: new Date().toISOString().slice(0, 10),
              tracking_params: {
                ...c.tracking_params,
                campaign: campaign || c.tracking_params.campaign || "2026W30",
              },
            };
          })
        );
        if (topicId) {
          const tid = topicId;
          setTopics((prev) =>
            prev.map((t) =>
              t.topic_id === tid ? { ...t, status: "published" } : t
            )
          );
        }
      },
      addDatabaseEntry(entry) {
        const id = entry.id?.trim() || uid("DB").toUpperCase();
        const today = new Date().toISOString().slice(0, 10);
        const row: ContentDatabaseEntry = {
          ...entry,
          id,
          created_at: today,
          updated_at: today,
        };
        setDatabaseEntries((prev) => [row, ...prev]);
        if (row.scheduled_day && row.scheduled_slot) {
          setCalendarSlots((prev) => [
            {
              slot_id: uid("slot"),
              entry_id: row.id,
              day: row.scheduled_day!,
              time: row.scheduled_slot!,
              brand: row.brand,
              platform: row.platform,
              title: row.topic,
              status: row.status,
              cta: row.cta,
            },
            ...prev.filter((s) => s.entry_id !== row.id),
          ]);
        }
        return row;
      },
      updateDatabaseEntry(id, patch) {
        setDatabaseEntries((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...patch,
                  updated_at: new Date().toISOString().slice(0, 10),
                }
              : e
          )
        );
        setCalendarSlots((prev) =>
          prev.map((s) => {
            if (s.entry_id !== id) return s;
            const next = { ...s };
            if (patch.topic) next.title = patch.topic;
            if (patch.brand) next.brand = patch.brand;
            if (patch.platform) next.platform = patch.platform;
            if (patch.status) next.status = patch.status;
            if (patch.cta) next.cta = patch.cta;
            if (patch.scheduled_day) next.day = patch.scheduled_day;
            if (patch.scheduled_slot) next.time = patch.scheduled_slot;
            return next;
          })
        );
      },
      deleteDatabaseEntry(id) {
        setDatabaseEntries((prev) => prev.filter((e) => e.id !== id));
        setCalendarSlots((prev) => prev.filter((s) => s.entry_id !== id));
      },
      scheduleEntry(entryId, day, time) {
        const entry = databaseEntries.find((e) => e.id === entryId);
        if (!entry) return null;
        const slot: CalendarSlot = {
          slot_id: uid("slot"),
          entry_id: entryId,
          day,
          time,
          brand: entry.brand,
          platform: entry.platform,
          title: entry.topic,
          status: "scheduled",
          cta: entry.cta,
        };
        setCalendarSlots((prev) => [
          slot,
          ...prev.filter((s) => s.entry_id !== entryId),
        ]);
        setDatabaseEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  status: "scheduled",
                  scheduled_day: day,
                  scheduled_slot: time,
                  updated_at: new Date().toISOString().slice(0, 10),
                }
              : e
          )
        );
        return slot;
      },
      unscheduleEntry(entryId) {
        setCalendarSlots((prev) => prev.filter((s) => s.entry_id !== entryId));
        setDatabaseEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  status: e.status === "scheduled" ? "ready" : e.status,
                  scheduled_day: undefined,
                  scheduled_slot: undefined,
                  updated_at: new Date().toISOString().slice(0, 10),
                }
              : e
          )
        );
      },
      moveCalendarSlot(slotId, day, time) {
        let entryId: string | null = null;
        setCalendarSlots((prev) =>
          prev.map((s) => {
            if (s.slot_id !== slotId) return s;
            entryId = s.entry_id;
            return { ...s, day, time };
          })
        );
        if (entryId) {
          const eid = entryId;
          setDatabaseEntries((prev) =>
            prev.map((e) =>
              e.id === eid
                ? {
                    ...e,
                    scheduled_day: day,
                    scheduled_slot: time,
                    status: "scheduled",
                    updated_at: new Date().toISOString().slice(0, 10),
                  }
                : e
            )
          );
        }
      },
      submitTaskForReview(taskId) {
        setContentTasks((prev) =>
          prev.map((t) =>
            t.task_id === taskId && t.status === "draft"
              ? { ...t, status: "in_review" }
              : t
          )
        );
      },
      approveTask(taskId, notes) {
        setContentTasks((prev) =>
          prev.map((t) => {
            if (t.task_id !== taskId || t.status !== "in_review") return t;
            return {
              ...t,
              status: "approved",
              reviewed_by: "human",
              reviewed_at: new Date().toISOString(),
              review_notes: notes || t.review_notes,
            };
          })
        );
      },
      rejectTask(taskId, notes) {
        setContentTasks((prev) =>
          prev.map((t) => {
            if (t.task_id !== taskId || t.status !== "in_review") return t;
            return {
              ...t,
              status: "rejected",
              reviewed_by: "human",
              reviewed_at: new Date().toISOString(),
              review_notes: notes,
            };
          })
        );
      },
      publishApprovedTask(taskId, url) {
        setContentTasks((prev) =>
          prev.map((t) => {
            if (t.task_id !== taskId) return t;
            if (t.status !== "approved" && t.status !== "scheduled") {
              // hard gate ù ignore illegal publish
              return t;
            }
            if (!t.reviewed_at) return t;
            return {
              ...t,
              status: "published",
              published_at: new Date().toISOString().slice(0, 10),
              publish_url: url,
            };
          })
        );
      },
      updateDeal(dealId, patch) {
        setDeals((prev) =>
          prev.map((d) => (d.deal_id === dealId ? { ...d, ...patch } : d))
        );
      },
      createDeal(input) {
        const title = (input?.title || "New deal").trim() || "New deal";
        const deal: Deal = {
          deal_id: uid("deal"),
          title,
          organization: input?.organization?.trim() || title,
          contact_person: input?.contact_person ?? null,
          contact_on: input?.contact_on ?? null,
          owner: input?.owner?.trim() || "Celi",
          status: input?.status || "Open",
          stage: input?.stage || "Lead",
          label: input?.label ?? null,
          channel: input?.channel ?? null,
          product_name: input?.product_name ?? null,
          product_quantity: input?.product_quantity ?? null,
          product_amount: input?.product_amount ?? null,
          amount: input?.amount ?? 0,
          currency: input?.currency || "USD",
          lost_reason: input?.lost_reason ?? null,
          closed_on: input?.closed_on ?? null,
          content_attribution_id: input?.content_attribution_id,
        };
        setDeals((prev) => [deal, ...prev]);
        return deal;
      },
      deleteDeal(dealId) {
        setDeals((prev) => prev.filter((d) => d.deal_id !== dealId));
      },
      createOutreachDraft(leadId) {
        const lead = leads.find((l) => l.lead_id === leadId);
        if (!lead) return null;
        const company = companies.find((c) => c.company_id === lead.company_id);
        const isSalon = lead.icp_type === "salon_clinic";
        const body = isSalon
          ? `Hi ${lead.full_name.split(" ")[0]} ù saw ${company?.name || "your salon"} investing in retention. Genpulse/Lushair can pair Hair Scan hardware with CRM tracking for client data continuity. Draft only ù human must approve send.`
          : `Hi ${lead.full_name.split(" ")[0]} ù researching ${company?.name || "your team"} against our ${lead.icp_type} ICP. Happy to share white-label / API options. Draft only ù human must approve send.`;
        const act: Activity = {
          activity_id: uid("act"),
          lead_id: leadId,
          type: "outreach_draft",
          content: body,
          created_by: "agent",
          created_at: new Date().toISOString(),
        };
        setActivities((prev) => [act, ...prev]);
        setLeads((prev) =>
          prev.map((l) =>
            l.lead_id === leadId && l.status === "scored"
              ? { ...l, status: "contacted" }
              : l
          )
        );
        return act;
      },

    };
  }, [
    knowledge,
    topics,
    content,
    events,
    growthInsights,
    creativeBriefs,
    databaseEntries,
    calendarSlots,
    contentTasks,
    leads,
    deals,
    activities,
    agentMessages,
    brandFilter,
    activeContentId,
    weekKey,
  ]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}
