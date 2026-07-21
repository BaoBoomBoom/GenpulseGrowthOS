-- =============================================================================
-- Genpulse Growth OS — Phase 1 MVP seed data
-- Run after: 001_phase1_schema.sql
-- Fixed UUIDs for reproducible FK chains / demos
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Brand voice presets
-- -----------------------------------------------------------------------------
INSERT INTO knowledge_items (
  knowledge_id, title, type, brand, topic_tags, summary, key_claims,
  evidence_level, usable_formats, audience_tags, safety_notes, status, last_reviewed_at
) VALUES
(
  'a1000000-0000-4000-8000-000000000001',
  'Genpulse Brand Voice',
  'brand',
  'Genpulse',
  ARRAY['brand', 'voice', 'genpulse'],
  'Genpulse speaks with scientific clarity that still feels approachable. Focus on personalization, biological signals, and actionable insight — never medical promises.',
  ARRAY[
    'Lead with signals and personalization, not diagnoses',
    'Tone: calm, evidence-aware, modern',
    'CTA preference: try personalized insights / download'
  ],
  'narrative',
  ARRAY['TikTok', 'Instagram', 'X', 'LinkedIn'],
  ARRAY['health-curious adults', 'women 20-40', 'biohackers'],
  'No disease claims. No guarantee of clinical outcomes. Avoid "cure", "treat", "diagnose".',
  'active',
  now()
),
(
  'a1000000-0000-4000-8000-000000000002',
  'Lushair Brand Voice',
  'brand',
  'Lushair',
  ARRAY['brand', 'voice', 'lushair', 'hair'],
  'Lushair speaks in beauty x biology language: ingredient clarity, scalp/hair scenarios, sensory confidence. Premium but practical.',
  ARRAY[
    'Center scalp health and visible hair quality',
    'Tone: refined, ingredient-literate, scenario-based',
    'CTA preference: learn more / shop / routine'
  ],
  'narrative',
  ARRAY['TikTok', 'Instagram', 'X', 'LinkedIn'],
  ARRAY['women hair concerns', 'scalp health seekers'],
  'Avoid drug-like efficacy claims. Do not promise regrowth percentages without approved evidence.',
  'active',
  now()
),
(
  'a1000000-0000-4000-8000-000000000003',
  'CEO / Founder Voice',
  'brand',
  'CEO',
  ARRAY['brand', 'voice', 'founder', 'ceo'],
  'First-person founder voice: builder energy, SF + NUS context, obsession with AI x health. Narrative allowed; science still must cite knowledge.',
  ARRAY[
    'Use I / we founder framing',
    'Connect personal obsession to product thesis',
    'CTA can bridge to Genpulse download when relevant'
  ],
  'narrative',
  ARRAY['TikTok', 'X', 'LinkedIn'],
  ARRAY['founders', 'operators', 'health-tech audience'],
  'Personal stories OK. Still no unverifiable medical claims.',
  'active',
  now()
);

-- -----------------------------------------------------------------------------
-- Research knowledge
-- -----------------------------------------------------------------------------
INSERT INTO knowledge_items (
  knowledge_id, title, type, brand, topic_tags, summary, key_claims,
  evidence_level, source_url, usable_formats, audience_tags, safety_notes, status, last_reviewed_at
) VALUES
(
  'a1000000-0000-4000-8000-000000000010',
  'Melatonin & sleep onset — mechanism summary',
  'research',
  'universal',
  ARRAY['sleep', 'melatonin', 'hormones', 'circadian'],
  'Melatonin helps signal biological night and supports sleep onset timing. Nighttime light and irregular schedules can blunt the signal people experience as tired but not deep sleep.',
  ARRAY[
    'Melatonin is a circadian timing signal more than a pure sedative',
    'Light exposure at night can suppress melatonin',
    'Sleep complaints often mix timing + continuity issues'
  ],
  'high',
  'https://example.com/sources/melatonin-mechanism',
  ARRAY['TikTok', 'Instagram', 'X', 'LinkedIn'],
  ARRAY['women 20-35 with sleep concerns', 'shift-adjacent lifestyles'],
  'Do not claim melatonin supplements cure insomnia. Prefer "may support timing" language.',
  'active',
  now()
),
(
  'a1000000-0000-4000-8000-000000000011',
  'Hair follicle cycle basics',
  'research',
  'universal',
  ARRAY['hair', 'hormones', 'scalp', 'biology'],
  'Hair follicles cycle through anagen, catagen, and telogen. Stress, hormonal shifts, and scalp inflammation can push more follicles into shedding phases.',
  ARRAY[
    'Shedding is often cycle-phase dynamics, not permanent loss overnight',
    'Hormonal and stress contexts matter for hair quality narratives',
    'Scalp environment influences visible hair outcomes'
  ],
  'high',
  'https://example.com/sources/hair-cycle',
  ARRAY['TikTok', 'Instagram', 'LinkedIn'],
  ARRAY['women hair shedding concerns'],
  'Avoid guaranteed regrowth claims. Separate shedding vs permanent loss carefully.',
  'active',
  now()
),
(
  'a1000000-0000-4000-8000-000000000012',
  'Hormone signals as personalization inputs',
  'research',
  'Genpulse',
  ARRAY['hormones', 'personalization', 'sleep', 'cycle'],
  'Hormone-related signals (sleep, energy, cycle-adjacent patterns) can be used as context for personalized health insights — as signals, not diagnoses.',
  ARRAY[
    'Personalization improves when context signals are structured',
    'Users respond to explanations that connect symptoms to mechanisms carefully',
    'CTA fit: download for personalized insights'
  ],
  'medium',
  NULL,
  ARRAY['TikTok', 'X', 'LinkedIn'],
  ARRAY['women 20-40', 'health personalization seekers'],
  'Frame as insight/context, never as medical diagnosis.',
  'active',
  now()
);

-- -----------------------------------------------------------------------------
-- Product knowledge
-- -----------------------------------------------------------------------------
INSERT INTO knowledge_items (
  knowledge_id, title, type, brand, topic_tags, summary, key_claims,
  evidence_level, usable_formats, audience_tags, safety_notes, status, last_reviewed_at
) VALUES
(
  'a1000000-0000-4000-8000-000000000020',
  'Genpulse product positioning',
  'product',
  'Genpulse',
  ARRAY['genpulse', 'product', 'personalization', 'sleep', 'hormones'],
  'Genpulse helps people turn health signals into personalized insights. Primary growth CTA for Phase 1: app download then activation then data upload.',
  ARRAY[
    'Positioning: AI health personalization from your signals',
    'Target: people who want clarity on sleep/energy/hormone-adjacent patterns',
    'Forbidden: disease treatment claims'
  ],
  'medium',
  ARRAY['TikTok', 'Instagram', 'X', 'LinkedIn'],
  ARRAY['women 20-35', 'bio-curious professionals'],
  'CTA links must include tracking params. No clinical outcome guarantees.',
  'active',
  now()
),
(
  'a1000000-0000-4000-8000-000000000021',
  'Lushair product positioning',
  'product',
  'Lushair',
  ARRAY['lushair', 'product', 'hair', 'scalp'],
  'Lushair focuses on scalp and hair quality routines grounded in biology-aware storytelling. Content should map to hair concerns and ingredient/scenario clarity.',
  ARRAY[
    'Core benefits: scalp comfort, hair quality support, routine simplicity',
    'Audience: people noticing shedding, dullness, scalp imbalance',
    'CTA: learn more / routine education'
  ],
  'medium',
  ARRAY['TikTok', 'Instagram', 'LinkedIn'],
  ARRAY['women hair concerns'],
  'Keep claims cosmetic-safe. Cross-link Genpulse only when intentional.',
  'active',
  now()
),
(
  'a1000000-0000-4000-8000-000000000022',
  'Sleep FAQ — tired but not sleeping deeply',
  'product',
  'Genpulse',
  ARRAY['sleep', 'faq', 'melatonin', 'hormones'],
  'Common user question: feeling tired at night but waking unrefreshed. Educational angle: timing vs continuity; invite personalized signal review in-app.',
  ARRAY[
    'Tired does not equal deep sleep automatically',
    'Useful content hook for TikTok + LinkedIn',
    'CTA: try personalized insights'
  ],
  'medium',
  ARRAY['TikTok', 'Instagram', 'LinkedIn'],
  ARRAY['women 20-35 with sleep concerns'],
  'Do not diagnose insomnia in copy.',
  'active',
  now()
);

-- -----------------------------------------------------------------------------
-- Founder stories
-- -----------------------------------------------------------------------------
INSERT INTO knowledge_items (
  knowledge_id, title, type, brand, topic_tags, summary, key_claims,
  evidence_level, usable_formats, audience_tags, safety_notes, status, last_reviewed_at
) VALUES
(
  'a1000000-0000-4000-8000-000000000030',
  'Why Genpulse — founder origin',
  'founder',
  'CEO',
  ARRAY['founder', 'genpulse', 'origin', 'ai-health'],
  'Founder story: built Genpulse from a belief that AI + personal health signals can make prevention and self-understanding more practical.',
  ARRAY[
    'Origin is belief-driven, not feature-driven',
    'Works well for LinkedIn / X founder IP',
    'Can bridge to Genpulse download CTA'
  ],
  'narrative',
  ARRAY['X', 'LinkedIn', 'TikTok'],
  ARRAY['founders', 'operators'],
  'Keep humble; avoid exaggerated traction claims unless verified.',
  'active',
  now()
),
(
  'a1000000-0000-4000-8000-000000000031',
  'Founder sleep optimization obsession',
  'founder',
  'CEO',
  ARRAY['founder', 'sleep', 'personal', 'hormones'],
  'Long-running personal focus on sleep quality and recovery as a lens into why signal-based personalization matters.',
  ARRAY[
    'Personal anecdote + product thesis pairing',
    'Good support for sleep education topics',
    'Voice: first person'
  ],
  'narrative',
  ARRAY['TikTok', 'X', 'LinkedIn'],
  ARRAY['health-curious professionals'],
  'Anecdote is not clinical evidence; pair with research knowledge when making mechanism claims.',
  'active',
  now()
),
(
  'a1000000-0000-4000-8000-000000000032',
  'NUS + SF builder context',
  'founder',
  'CEO',
  ARRAY['founder', 'nus', 'sf', 'story'],
  'Background anchors: NUS training and SF building context. Useful credibility texture for LinkedIn founder posts.',
  ARRAY[
    'Credibility without credential dumping',
    'Best for LinkedIn long-form',
    'Optional soft CTA to Genpulse'
  ],
  'narrative',
  ARRAY['LinkedIn', 'X'],
  ARRAY['founders', 'health-tech'],
  NULL,
  'active',
  now()
);

-- -----------------------------------------------------------------------------
-- Sample topic (PRD end-to-end example)
-- -----------------------------------------------------------------------------
INSERT INTO topics (
  topic_id, title, core_angle, objective, brand, platform, audience,
  source_knowledge_ids, evidence_level, format_hint, hook_candidates, cta_type,
  priority_score, status, week_key
) VALUES (
  'b2000000-0000-4000-8000-000000000001',
  '??????????????????????',
  'Reframe poor sleep continuity as timing/signal issue rather than willpower; invite personalized insights.',
  'app downloads',
  'Genpulse',
  ARRAY['TikTok', 'LinkedIn'],
  'women 20-35 with sleep concerns',
  ARRAY[
    'a1000000-0000-4000-8000-000000000010'::uuid,
    'a1000000-0000-4000-8000-000000000022'::uuid,
    'a1000000-0000-4000-8000-000000000031'::uuid
  ],
  'high',
  'short video + long post',
  ARRAY[
    '??????????????????????',
    '???????????????',
    'Melatonin ??????????????'
  ],
  'download',
  86.50,
  'selected',
  to_char(now(), 'IYYY') || '-W' || lpad(to_char(now(), 'IW'), 2, '0')
);

-- Lushair sample topic (backlog)
INSERT INTO topics (
  topic_id, title, core_angle, objective, brand, platform, audience,
  source_knowledge_ids, evidence_level, format_hint, hook_candidates, cta_type,
  priority_score, status, week_key
) VALUES (
  'b2000000-0000-4000-8000-000000000002',
  '??????????????',
  'Explain shedding via follicle cycle + stress/hormone context; soft CTA to Lushair routine education.',
  'awareness',
  'Lushair',
  ARRAY['TikTok', 'Instagram'],
  'women noticing increased shedding',
  ARRAY[
    'a1000000-0000-4000-8000-000000000011'::uuid,
    'a1000000-0000-4000-8000-000000000021'::uuid,
    'a1000000-0000-4000-8000-000000000002'::uuid
  ],
  'high',
  'short video + carousel',
  ARRAY[
    '??????????????',
    '???????????????????',
    '?????????????'
  ],
  'learn_more',
  78.00,
  'backlog',
  to_char(now(), 'IYYY') || '-W' || lpad(to_char(now(), 'IW'), 2, '0')
);

-- -----------------------------------------------------------------------------
-- Sample multi-platform content
-- -----------------------------------------------------------------------------
INSERT INTO content_assets (
  content_id, topic_id, brand, platform, content_type, title,
  script_or_copy, hook, cta, source_knowledge_ids, status
) VALUES
(
  'c3000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  'Genpulse',
  'TikTok',
  'video',
  '??????TikTok',
  jsonb_build_object(
    'hook', '??????????????????????',
    'talking_points', jsonb_build_array(
      '???????????????',
      '??????? melatonin ????',
      '?????????????'
    ),
    'narrator_notes', 'Fast cuts; on-screen: ? / ?? / ??',
    'cta', '?? Genpulse ??????????',
    'caption', '??????????????????',
    'on_screen_text', jsonb_build_array('??????', '?????', '????')
  ),
  '??????????????????????',
  '?? Genpulse ??????????',
  ARRAY[
    'a1000000-0000-4000-8000-000000000010'::uuid,
    'a1000000-0000-4000-8000-000000000022'::uuid,
    'a1000000-0000-4000-8000-000000000001'::uuid
  ],
  'approved'
),
(
  'c3000000-0000-4000-8000-000000000002',
  'b2000000-0000-4000-8000-000000000001',
  'Genpulse',
  'LinkedIn',
  'post',
  '??????LinkedIn',
  jsonb_build_object(
    'opening_insight', 'Many high performers feel tired at night yet wake unrefreshed — and blame discipline.',
    'body', 'Sleep continuity often tracks circadian timing and light context more than willpower. Melatonin is better framed as a biological night signal than a blunt sedative.',
    'evidence_section', 'Mechanism summary: melatonin timing + nighttime light suppression (see linked research knowledge).',
    'conclusion', 'Personal health systems should start from signals, not self-blame.',
    'cta', 'Explore AI health personalization on Genpulse'
  ),
  'Many high performers feel tired at night yet wake unrefreshed — and blame discipline.',
  'Explore AI health personalization on Genpulse',
  ARRAY[
    'a1000000-0000-4000-8000-000000000010'::uuid,
    'a1000000-0000-4000-8000-000000000012'::uuid,
    'a1000000-0000-4000-8000-000000000031'::uuid,
    'a1000000-0000-4000-8000-000000000001'::uuid
  ],
  'approved'
);

-- Publish TikTok version (tracking_params synced by trigger)
UPDATE content_assets
SET
  status = 'published',
  published_at = now() - interval '3 days',
  publish_url = 'https://www.tiktok.com/@genpulse/video/seed001',
  tracking_params = tracking_params || jsonb_build_object(
    'campaign', '2026W30',
    'cta_type', 'download'
  )
WHERE content_id = 'c3000000-0000-4000-8000-000000000001';

INSERT INTO published_posts (
  publish_id, content_id, platform, published_at, url, campaign_tag
) VALUES (
  'd4000000-0000-4000-8000-000000000001',
  'c3000000-0000-4000-8000-000000000001',
  'TikTok',
  now() - interval '3 days',
  'https://www.tiktok.com/@genpulse/video/seed001',
  '2026W30'
);

UPDATE topics
SET status = 'published'
WHERE topic_id = 'b2000000-0000-4000-8000-000000000001';

-- -----------------------------------------------------------------------------
-- Sample performance events (PRD example numbers)
-- -----------------------------------------------------------------------------
INSERT INTO performance_events (
  event_id, content_id, topic_id, brand, platform, event_type, value, event_date, campaign_tag
) VALUES
(
  'e5000000-0000-4000-8000-000000000001',
  'c3000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  'Genpulse', 'TikTok', 'impression', 12000, (CURRENT_DATE - 2), '2026W30'
),
(
  'e5000000-0000-4000-8000-000000000002',
  'c3000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  'Genpulse', 'TikTok', 'click', 340, (CURRENT_DATE - 2), '2026W30'
),
(
  'e5000000-0000-4000-8000-000000000003',
  'c3000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  'Genpulse', 'TikTok', 'install', 46, (CURRENT_DATE - 1), '2026W30'
),
(
  'e5000000-0000-4000-8000-000000000004',
  'c3000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  'Genpulse', 'TikTok', 'activation', 12, (CURRENT_DATE - 1), '2026W30'
),
(
  'e5000000-0000-4000-8000-000000000005',
  'c3000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000001',
  'Genpulse', 'TikTok', 'upload', 4, CURRENT_DATE, '2026W30'
);

COMMIT;

-- -----------------------------------------------------------------------------
-- Smoke checks
-- -----------------------------------------------------------------------------
-- SELECT type, brand, count(*) FROM knowledge_items GROUP BY 1, 2 ORDER BY 1, 2;
-- SELECT title, brand, priority_score, status FROM topics ORDER BY priority_score DESC;
-- SELECT platform, status, tracking_params FROM content_assets ORDER BY platform;
-- SELECT event_type, sum(value) FROM performance_events GROUP BY 1 ORDER BY 1;
-- SELECT * FROM v_content_performance_weekly;
