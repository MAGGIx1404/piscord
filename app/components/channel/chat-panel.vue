<template>
  <div class="size-full relative">
    <!-- Chat panel -->
    <div class="size-full space-y-4 rounded-xl overflow-hidden">
      <div class="size-full flex flex-col gap-4 overflow-y-scroll pt-32 pb-20">
        <ChannelChatMessage
          v-for="chat in chats"
          :key="chat.id"
          :chat="chat"
          :replyToMessage="chat.isReply ? getMessageById(chat.messageId) : null"
        />
      </div>
    </div>

    <ChannelChatForm />
  </div>
</template>

<script setup>
const chats = [
  {
    id: "m1",
    author: { id: "usr_alice_000000000000001", name: "Alice", image: "/images/avatar/1.png" },
    userId: "usr_alice_000000000000001",
    message:
      "Hey team — before we lock the API contract, please double-check the edge cases for pagination, filtering and error responses. I noticed the current draft omits clear error codes for rate limit scenarios and partial-success payloads; we should standardize on a structure so frontends can gracefully recover.",
    timestamp: "2025-12-08T09:00:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 5, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m1_r1",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "Good call — I'll add explicit examples for 429 and for partial success (207) with sample JSON payloads so the SDK can map them automatically. Also proposing we include a `retryAfter` field when applicable.",
    timestamp: "2025-12-08T09:03:00Z",
    isReply: true,
    messageId: "m1",
    images: [],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m1_r2",
    author: { id: "usr_ryan_000000000000002", name: "Ryan", image: "/images/avatar/3.png" },
    userId: "usr_ryan_000000000000002",
    message:
      "I'll update the API spec and add examples for clients in JS and Python. Should we include a tiny note about idempotency on POST /jobs?",
    timestamp: "2025-12-08T09:05:00Z",
    isReply: true,
    messageId: "m1",
    images: ["/images/servers/2.png"],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m2",
    author: { id: "usr_sam_000000000000003", name: "Sam", image: "/images/avatar/4.png" },
    userId: "usr_sam_000000000000003",
    message:
      "Morning — pushed a large UI update to the dashboard branch. It changes layout, adds new filters, and bundles a small charting library. Before we merge, can someone sanity-check accessibility (keyboard focus + contrast)?",
    timestamp: "2025-12-08T09:10:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/1.png", "/images/servers/3.png"],
    reactions: { like: 6, love: 2, laugh: 0, angry: 0 }
  },
  {
    id: "m3",
    author: { id: "usr_maya_000000000000004", name: "Maya", image: "/images/avatar/5.png" },
    userId: "usr_maya_000000000000004",
    message:
      "I ran Lighthouse quickly — performance dropped a bit due to the chart library but accessibility score looks fine overall. I can file a PR with lazy-loading the charts and deferring non-critical scripts.",
    timestamp: "2025-12-08T09:12:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 4, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m3_r1",
    author: { id: "usr_alice_000000000000001", name: "Alice", image: "/images/avatar/1.png" },
    userId: "usr_alice_000000000000001",
    message:
      "Please do — lazy-loading will probably regain most of the perf. Also consider splitting the vendor bundle for charts so initial payload is smaller.",
    timestamp: "2025-12-08T09:14:00Z",
    isReply: true,
    messageId: "m3",
    images: [],
    reactions: { like: 2, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m4",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "Heads up: I discovered intermittent 500s from the analytics worker during high load. Stack traces point to a race in the in-memory queue consumer. I'll push a fix that adds a small mutex and better backoff; we should also add a canary to staging.",
    timestamp: "2025-12-08T09:18:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/4.png"],
    reactions: { like: 7, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m4_r1",
    author: { id: "usr_priya_000000000000005", name: "Priya", image: "/images/avatar/6.png" },
    userId: "usr_priya_000000000000005",
    message:
      "I can spin up a staging worker cluster and run a load test to verify the fix. Suggest we increase log level temporarily to capture more context if it reappears.",
    timestamp: "2025-12-08T09:20:00Z",
    isReply: true,
    messageId: "m4",
    images: [],
    reactions: { like: 3, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m5",
    author: { id: "usr_omar_000000000000006", name: "Omar", image: "/images/avatar/7.png" },
    userId: "usr_omar_000000000000006",
    message:
      "Small UX question: should message threads open inline or in a right-hand panel? Inline keeps context, panel gives more space for long threads — leaning toward panel for mobile friendliness.",
    timestamp: "2025-12-08T09:25:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m5_r1",
    author: { id: "usr_lina_000000000000007", name: "Lina", image: "/images/avatar/8.png" },
    userId: "usr_lina_000000000000007",
    message:
      "Panel seems better for heavy threads; inline is fine for simple replies. What if we do inline by default and switch to a panel when the thread exceeds N replies?",
    timestamp: "2025-12-08T09:27:00Z",
    isReply: true,
    messageId: "m5",
    images: [],
    reactions: { like: 4, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m6",
    author: { id: "usr_chen_000000000000008", name: "Chen", image: "/images/avatar/9.png" },
    userId: "usr_chen_000000000000008",
    message:
      "Deployment note: CDN invalidation takes ~90s for the dashboard assets. If we deploy hotfixes late, we might want to pre-warm caches or use versioned URLs to avoid downtime. Attached screenshot shows recent cache stats.",
    timestamp: "2025-12-08T09:32:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/5.png", "/images/servers/1.png"],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m7",
    author: { id: "usr_zoe_000000000000009", name: "Zoe", image: "/images/avatar/10.png" },
    userId: "usr_zoe_000000000000009",
    message:
      "Design question: the new onboarding flow has 6 steps now and the completion rates drop at step 4. I propose we A/B test a shorter 4-step flow emphasizing immediate value — I sketched two variants.",
    timestamp: "2025-12-08T09:36:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/2.png", "/images/servers/3.png"],
    reactions: { like: 8, love: 2, laugh: 0, angry: 0 }
  },
  {
    id: "m7_r1",
    author: { id: "usr_sam_000000000000003", name: "Sam", image: "/images/avatar/4.png" },
    userId: "usr_sam_000000000000003",
    message:
      "Variant B looks promising. If we A/B test, let's make sure events capture which variant and the exact timestamp of steps for funnel analysis.",
    timestamp: "2025-12-08T09:38:00Z",
    isReply: true,
    messageId: "m7",
    images: [],
    reactions: { like: 5, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m8",
    author: { id: "usr_alice_000000000000001", name: "Alice", image: "/images/avatar/1.png" },
    userId: "usr_alice_000000000000001",
    message:
      "Reminder: grant access to the analytics dashboard only to product & ops for now. I removed dev access yesterday and noticed a few jobs still attempt to fetch private endpoints; we'll track and audit any failed attempts.",
    timestamp: "2025-12-08T09:42:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m9",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "FYI I added a migration to mark legacy sessions as expired after a 30-day inactivity threshold. Long-running sessions caused token bloat in Redis; the migration is idempotent but please review logs in staging.",
    timestamp: "2025-12-08T09:45:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/4.png"],
    reactions: { like: 6, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m9_r1",
    author: { id: "usr_priya_000000000000005", name: "Priya", image: "/images/avatar/6.png" },
    userId: "usr_priya_000000000000005",
    message:
      "Thanks — I'll run the migration on staging tonight and monitor Redis memory. Let me know if we need a window for production.",
    timestamp: "2025-12-08T09:48:00Z",
    isReply: true,
    messageId: "m9",
    images: [],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m10",
    author: { id: "usr_ryan_000000000000002", name: "Ryan", image: "/images/avatar/3.png" },
    userId: "usr_ryan_000000000000002",
    message:
      "Quick dev note: I refactored the auth middleware to be composable and added tests. There was an edge case with token refresh that the tests caught — pushing patch now.",
    timestamp: "2025-12-08T09:50:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 4, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m11",
    author: { id: "usr_maya_000000000000004", name: "Maya", image: "/images/avatar/5.png" },
    userId: "usr_maya_000000000000004",
    message:
      "I created a doc outlining the release checklist for next week: feature flags, smoke tests, DB backups, CDN invalidation steps, and rollback plan. Link is in the project wiki.",
    timestamp: "2025-12-08T09:55:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/5.png"],
    reactions: { like: 5, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m11_r1",
    author: { id: "usr_omar_000000000000006", name: "Omar", image: "/images/avatar/7.png" },
    userId: "usr_omar_000000000000006",
    message:
      "I'll prepare DB snapshot and verify restore on staging to validate the rollback plan.",
    timestamp: "2025-12-08T09:57:00Z",
    isReply: true,
    messageId: "m11",
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m12",
    author: { id: "usr_lina_000000000000007", name: "Lina", image: "/images/avatar/8.png" },
    userId: "usr_lina_000000000000007",
    message:
      "Idea: add subtle microcopy in the onboarding screens explaining why we ask for certain permissions — should reduce drop-off due to privacy concerns. Draft copy uploaded to Figma.",
    timestamp: "2025-12-08T10:00:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/1.png"],
    reactions: { like: 3, love: 2, laugh: 0, angry: 0 }
  },
  {
    id: "m12_r1",
    author: { id: "usr_zoe_000000000000009", name: "Zoe", image: "/images/avatar/10.png" },
    userId: "usr_zoe_000000000000009",
    message:
      "Love that — good microcopy can really help. I'll review the Figma notes and add alternative wordings.",
    timestamp: "2025-12-08T10:02:00Z",
    isReply: true,
    messageId: "m12",
    images: [],
    reactions: { like: 2, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m13",
    author: { id: "usr_sam_000000000000003", name: "Sam", image: "/images/avatar/4.png" },
    userId: "usr_sam_000000000000003",
    message:
      "We should consider adding a lightweight analytics pixel for partner sites to capture referral quality. It must be tiny and opt-in though — privacy first.",
    timestamp: "2025-12-08T10:05:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m14",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "I spent the morning reviewing the legacy importer — there are subtle differences in CSV column order across clients which can corrupt data mapping. I propose a two-step ingest: schema detection + strict validation step that rejects ambiguous rows with a detailed report back to the client. This will add a bit of latency but save us from silent data corruption.",
    timestamp: "2025-12-08T10:10:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 6, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m15",
    author: { id: "usr_priya_000000000000005", name: "Priya", image: "/images/avatar/6.png" },
    userId: "usr_priya_000000000000005",
    message:
      "On the security side: we should rotate a few of the long-lived keys and notify integrators of a deprecation timeline. I'll prepare the key-rotation doc with step-by-step instructions for customers.",
    timestamp: "2025-12-08T10:15:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/2.png"],
    reactions: { like: 4, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m15_r1",
    author: { id: "usr_ryan_000000000000002", name: "Ryan", image: "/images/avatar/3.png" },
    userId: "usr_ryan_000000000000002",
    message:
      "Make sure rotation has a fallback window; some integrators may be slow. We can allow a 7-day overlap where both old and new keys are valid.",
    timestamp: "2025-12-08T10:17:00Z",
    isReply: true,
    messageId: "m15",
    images: [],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m16",
    author: { id: "usr_omar_000000000000006", name: "Omar", image: "/images/avatar/7.png" },
    userId: "usr_omar_000000000000006",
    message:
      "I experimented with a client-side caching layer for frequently requested meta endpoints. The POC reduces API calls by ~40% on repeated navigation flows. We should evaluate cache invalidation rules carefully (short TTL, and conditional revalidation on major updates). Attached graphs show request counts before/after.",
    timestamp: "2025-12-08T10:20:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/3.png", "/images/servers/5.png"],
    reactions: { like: 5, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m17",
    author: { id: "usr_lina_000000000000007", name: "Lina", image: "/images/avatar/8.png" },
    userId: "usr_lina_000000000000007",
    message:
      "I can help draft the cache invalidation policy and propose a few TTL defaults based on resource volatility.",
    timestamp: "2025-12-08T10:25:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m18",
    author: { id: "usr_chen_000000000000008", name: "Chen", image: "/images/avatar/9.png" },
    userId: "usr_chen_000000000000008",
    message:
      "FYI I noticed a gradual memory increase in the worker process over 48 hours — looks like a small leak in the event emitter handlers. I'll add weak references and a benchmark to prove fix effectiveness.",
    timestamp: "2025-12-08T10:27:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/4.png"],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m18_r1",
    author: { id: "usr_maya_000000000000004", name: "Maya", image: "/images/avatar/5.png" },
    userId: "usr_maya_000000000000004",
    message: "If you want, I can help run the benchmark and produce a before/after for the PR.",
    timestamp: "2025-12-08T10:29:00Z",
    isReply: true,
    messageId: "m18",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m19",
    author: { id: "usr_zoe_000000000000009", name: "Zoe", image: "/images/avatar/10.png" },
    userId: "usr_zoe_000000000000009",
    message:
      "Marketing: planning an email campaign for power users about the new dashboard features. Draft copy is in the marketing drive — would appreciate technical bullet points for the email explaining how the charts are computed.",
    timestamp: "2025-12-08T10:35:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/1.png"],
    reactions: { like: 4, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m20",
    author: { id: "usr_alice_000000000000001", name: "Alice", image: "/images/avatar/1.png" },
    userId: "usr_alice_000000000000001",
    message:
      "I pushed a small styling fix for the mobile header (padding issue). It's minor but makes the header more tappable on phones. Please approve the patch if it looks fine on your devices.",
    timestamp: "2025-12-08T10:40:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m20_r1",
    author: { id: "usr_sam_000000000000003", name: "Sam", image: "/images/avatar/4.png" },
    userId: "usr_sam_000000000000003",
    message: "Checked on Android and iOS — looks good and feels better to tap. Approved.",
    timestamp: "2025-12-08T10:42:00Z",
    isReply: true,
    messageId: "m20",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m21",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "For the next sprint, let's prioritize crash-free sessions and improve our end-to-end tests. We had a couple of regressions that unit tests didn't catch. I'll prepare scenarios for Cypress to cover common flows.",
    timestamp: "2025-12-08T10:45:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/2.png"],
    reactions: { like: 6, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m22",
    author: { id: "usr_priya_000000000000005", name: "Priya", image: "/images/avatar/6.png" },
    userId: "usr_priya_000000000000005",
    message:
      "Security quick-check: confirmed OAuth revocation endpoint is returning correct status codes after rotation test. No action needed now but will document audit trail.",
    timestamp: "2025-12-08T10:50:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m23",
    author: { id: "usr_omar_000000000000006", name: "Omar", image: "/images/avatar/7.png" },
    userId: "usr_omar_000000000000006",
    message:
      "Note: onboarding translations for Spanish and Hindi are about 60% complete. We should schedule a final linguistic QA with native reviewers before release.",
    timestamp: "2025-12-08T10:55:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/5.png"],
    reactions: { like: 2, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m24",
    author: { id: "usr_lina_000000000000007", name: "Lina", image: "/images/avatar/8.png" },
    userId: "usr_lina_000000000000007",
    message:
      "I drafted the QA checklist for translations and added context notes for tricky phrases. Please review and add any missing context keys that might affect meaning.",
    timestamp: "2025-12-08T11:00:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m25",
    author: { id: "usr_chen_000000000000008", name: "Chen", image: "/images/avatar/9.png" },
    userId: "usr_chen_000000000000008",
    message:
      "I pushed monitoring alerts for error rates and latency percentiles. If anyone sees repeated alert noise, ping me and I'll tune thresholds or add a suppression window.",
    timestamp: "2025-12-08T11:05:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/3.png"],
    reactions: { like: 4, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m25_r1",
    author: { id: "usr_maya_000000000000004", name: "Maya", image: "/images/avatar/5.png" },
    userId: "usr_maya_000000000000004",
    message:
      "The alert on worker queue depth was noisy earlier; a short suppression window helped. I'll report any further noise.",
    timestamp: "2025-12-08T11:07:00Z",
    isReply: true,
    messageId: "m25",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m26",
    author: { id: "usr_zoe_000000000000009", name: "Zoe", image: "/images/avatar/10.png" },
    userId: "usr_zoe_000000000000009",
    message:
      "The content team wants an export of weekly user engagement for the past quarter, broken down by cohort and source. It will take a small analytics job; can the team estimate runtime and any DB impact?",
    timestamp: "2025-12-08T11:10:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/4.png", "/images/servers/1.png"],
    reactions: { like: 3, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m26_r1",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "Estimate: a pre-aggregated job can run in under 3 minutes using existing rollups; a full live scan may take much longer and impact replicas. I'll prepare a short proposal with the expected DB load.",
    timestamp: "2025-12-08T11:13:00Z",
    isReply: true,
    messageId: "m26",
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m27",
    author: { id: "usr_priya_000000000000005", name: "Priya", image: "/images/avatar/6.png" },
    userId: "usr_priya_000000000000005",
    message:
      "Reminder: design review tomorrow at 11 AM. Please add items to the agenda if you want a slot.",
    timestamp: "2025-12-08T11:20:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m28",
    author: { id: "usr_omar_000000000000006", name: "Omar", image: "/images/avatar/7.png" },
    userId: "usr_omar_000000000000006",
    message:
      "I deployed a small analytics probe to staging to measure client-side event fidelity. Expect minor extra traffic for 24 hours; it helps ensure our event schema captures real-world flows.",
    timestamp: "2025-12-08T11:25:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/5.png"],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m29",
    author: { id: "usr_lina_000000000000007", name: "Lina", image: "/images/avatar/8.png" },
    userId: "usr_lina_000000000000007",
    message:
      "Tiny UI request: can we increase the tap target for the floating action button to 48px? Accessibility guidelines recommend this for mobile.",
    timestamp: "2025-12-08T11:30:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m29_r1",
    author: { id: "usr_sam_000000000000003", name: "Sam", image: "/images/avatar/4.png" },
    userId: "usr_sam_000000000000003",
    message: "Agree — increased it and verified on a device; will push the change shortly.",
    timestamp: "2025-12-08T11:32:00Z",
    isReply: true,
    messageId: "m29",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m30",
    author: { id: "usr_chen_000000000000008", name: "Chen", image: "/images/avatar/9.png" },
    userId: "usr_chen_000000000000008",
    message:
      "Note: I created a lightweight dashboard showing recent deployments and error spikes; it's at /internal/deployments. It may be useful for on-call rotation.",
    timestamp: "2025-12-08T11:35:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/2.png"],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m31",
    author: { id: "usr_maya_000000000000004", name: "Maya", image: "/images/avatar/5.png" },
    userId: "usr_maya_000000000000004",
    message:
      "Regarding analytics quality, I recommend adding a schema validation step client-side before sending events — it dramatically reduces malformed events and simplifies pipeline processing. I can prototype this as a tiny library next sprint.",
    timestamp: "2025-12-08T11:40:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 4, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m32",
    author: { id: "usr_zoe_000000000000009", name: "Zoe", image: "/images/avatar/10.png" },
    userId: "usr_zoe_000000000000009",
    message:
      "Question: do we expose a public changelog for each minor release? I feel transparency helps integrators plan, but we should avoid leaking internal-only notes.",
    timestamp: "2025-12-08T11:45:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m33",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "Short: yes, public changelog is good — keep internal notes in private channels and redact sensitive items.",
    timestamp: "2025-12-08T11:50:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m34",
    author: { id: "usr_priya_000000000000005", name: "Priya", image: "/images/avatar/6.png" },
    userId: "usr_priya_000000000000005",
    message:
      "FYI — I ran a quick audit and flagged one dependency with a moderate CVE. We should patch the dependency and run our security tests; I'll open the PR.",
    timestamp: "2025-12-08T11:55:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/4.png"],
    reactions: { like: 5, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m34_r1",
    author: { id: "usr_ryan_000000000000002", name: "Ryan", image: "/images/avatar/3.png" },
    userId: "usr_ryan_000000000000002",
    message: "I'll prioritize the dependency PR and include a short changelog entry for the patch.",
    timestamp: "2025-12-08T11:58:00Z",
    isReply: true,
    messageId: "m34",
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m35",
    author: { id: "usr_omar_000000000000006", name: "Omar", image: "/images/avatar/7.png" },
    userId: "usr_omar_000000000000006",
    message:
      "Weekend ops: who can be on-call Saturday afternoon? We had a small outage last weekend and want to ensure coverage. I'll prepare a short runbook for common incidents.",
    timestamp: "2025-12-08T12:00:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m35_r1",
    author: { id: "usr_lina_000000000000007", name: "Lina", image: "/images/avatar/8.png" },
    userId: "usr_lina_000000000000007",
    message:
      "I can take the first shift on Saturday. Please share the runbook and any important contacts.",
    timestamp: "2025-12-08T12:03:00Z",
    isReply: true,
    messageId: "m35",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m36",
    author: { id: "usr_maya_000000000000004", name: "Maya", image: "/images/avatar/5.png" },
    userId: "usr_maya_000000000000004",
    message:
      "Quick note: I updated translations for the new modal copy and added context comments for ambiguous strings. Please pull latest Figma if you review the wording.",
    timestamp: "2025-12-08T12:10:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/1.png"],
    reactions: { like: 2, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m37",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "I pushed a small performance fix for the auth token cache — it reduces a token fetch in the hot path and should shave off ~30ms in some flows. I'll monitor telemetry.",
    timestamp: "2025-12-08T12:15:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 4, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m37_r1",
    author: { id: "usr_chen_000000000000008", name: "Chen", image: "/images/avatar/9.png" },
    userId: "usr_chen_000000000000008",
    message: "Nice — I'll check the traces for reduced latency after the change.",
    timestamp: "2025-12-08T12:18:00Z",
    isReply: true,
    messageId: "m37",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m38",
    author: { id: "usr_zoe_000000000000009", name: "Zoe", image: "/images/avatar/10.png" },
    userId: "usr_zoe_000000000000009",
    message:
      "Heads up: the design system team released a new color token set. Some of the older components may need updates. I'll open a PR with the migration guide.",
    timestamp: "2025-12-08T12:22:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/2.png"],
    reactions: { like: 3, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m39",
    author: { id: "usr_sam_000000000000003", name: "Sam", image: "/images/avatar/4.png" },
    userId: "usr_sam_000000000000003",
    message:
      "I adjusted a couple of icon weights to match the new tokens and fixed spacing in the header. Screenshots attached.",
    timestamp: "2025-12-08T12:25:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/3.png", "/images/servers/4.png"],
    reactions: { like: 5, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m39_r1",
    author: { id: "usr_alice_000000000000001", name: "Alice", image: "/images/avatar/1.png" },
    userId: "usr_alice_000000000000001",
    message: "Looks consistent — nice work. Please include before/after in the PR description.",
    timestamp: "2025-12-08T12:27:00Z",
    isReply: true,
    messageId: "m39",
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m40",
    author: { id: "usr_ryan_000000000000002", name: "Ryan", image: "/images/avatar/3.png" },
    userId: "usr_ryan_000000000000002",
    message:
      "Reminder: smoke tests will run automatically after staging deploy. If you push a breaking change, add the `skip-smoke` flag with caution.",
    timestamp: "2025-12-08T12:30:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m41",
    author: { id: "usr_maya_000000000000004", name: "Maya", image: "/images/avatar/5.png" },
    userId: "usr_maya_000000000000004",
    message:
      "I noticed one of the smoke tests is flaky on older iOS versions — I'll isolate the flakiness and open a ticket.",
    timestamp: "2025-12-08T12:33:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m42",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "I triaged the flaky test and added a small wait-for-stability in the E2E setup — should reduce false negatives. Will monitor the CI runs.",
    timestamp: "2025-12-08T12:35:00Z",
    isReply: true,
    messageId: "m41",
    images: [],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m43",
    author: { id: "usr_priya_000000000000005", name: "Priya", image: "/images/avatar/6.png" },
    userId: "usr_priya_000000000000005",
    message:
      "Security note: added automated scanning on PRs for known offending patterns. It flags some legacy code that uses eval-like constructs; we'll need to refactor a couple of places.",
    timestamp: "2025-12-08T12:40:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 4, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m44",
    author: { id: "usr_chen_000000000000008", name: "Chen", image: "/images/avatar/9.png" },
    userId: "usr_chen_000000000000008",
    message:
      "I analyzed the recent memory bump and the weak ref change eliminated the leak in my benchmark. I'll open a PR with the test harness included.",
    timestamp: "2025-12-08T12:45:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/5.png"],
    reactions: { like: 3, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m44_r1",
    author: { id: "usr_maya_000000000000004", name: "Maya", image: "/images/avatar/5.png" },
    userId: "usr_maya_000000000000004",
    message:
      "Great — once merged we should schedule a longer-running soak to ensure no regression.",
    timestamp: "2025-12-08T12:47:00Z",
    isReply: true,
    messageId: "m44",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m45",
    author: { id: "usr_zoe_000000000000009", name: "Zoe", image: "/images/avatar/10.png" },
    userId: "usr_zoe_000000000000009",
    message:
      "Marketing asked for brief technical blurbs for the feature page. Jeet, can you give two lines describing the performance improvements so we can include them?",
    timestamp: "2025-12-08T12:50:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m45_r1",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "Sure — “Reduced token fetch latency by caching recent tokens in-process, lowering average request time by ~30ms in hot paths.” and “Improved queue reliability under peak by adding backoff and mutex on consumer.”",
    timestamp: "2025-12-08T12:51:00Z",
    isReply: true,
    messageId: "m45",
    images: [],
    reactions: { like: 3, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m46",
    author: { id: "usr_sam_000000000000003", name: "Sam", image: "/images/avatar/4.png" },
    userId: "usr_sam_000000000000003",
    message:
      "Also — small UX polish request: align checkboxes vertically in settings modal and reduce left padding by 6px. It's a tiny visual but improves perceived density.",
    timestamp: "2025-12-08T12:55:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m47",
    author: { id: "usr_ryan_000000000000002", name: "Ryan", image: "/images/avatar/3.png" },
    userId: "usr_ryan_000000000000002",
    message: "I'll bundle the small UX tweaks into the next patch and include screenshots for QA.",
    timestamp: "2025-12-08T12:58:00Z",
    isReply: true,
    messageId: "m46",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m48",
    author: { id: "usr_priya_000000000000005", name: "Priya", image: "/images/avatar/6.png" },
    userId: "usr_priya_000000000000005",
    message:
      "Security follow-up: patched the moderate CVE and added a regression test. The PR includes a short explanation for auditors.",
    timestamp: "2025-12-08T13:05:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 4, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m49",
    author: { id: "usr_chen_000000000000008", name: "Chen", image: "/images/avatar/9.png" },
    userId: "usr_chen_000000000000008",
    message:
      "Ops note: scheduled DB snapshots at 02:00 UTC daily and a higher-frequency archive on release days. Added a restore playbook to the runbook.",
    timestamp: "2025-12-08T13:10:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/1.png"],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m50",
    author: { id: "cmivtfmzd0000c0ucoi2ppjit", name: "Jeet", image: "/images/avatar/2.png" },
    userId: "cmivtfmzd0000c0ucoi2ppjit",
    message:
      "Great progress today — thanks all. I'll follow up with the migration plan, the changelog entry, and the small perf notes for marketing. If anything urgent pops up tonight, ping me on pager and I'll jump in.",
    timestamp: "2025-12-08T13:15:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/5.png"],
    reactions: { like: 8, love: 2, laugh: 0, angry: 0 }
  }
];

function getMessageById(id) {
  return chats.find((chat) => chat.id === id);
}
</script>
