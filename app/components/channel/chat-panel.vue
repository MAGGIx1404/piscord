<template>
  <div class="size-full relative">
    <!-- Chat panel -->
    <div class="size-full space-y-4 overflow-hidden">
      <div class="size-full overflow-y-scroll pt-32 pb-20">
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
    author: { name: "Alice", image: "/images/avatar/1.png" },
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
    author: { name: "Jeet", image: "/images/avatar/2.png" },
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
    author: { name: "Ryan", image: "/images/avatar/3.png" },
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
    author: { name: "Sam", image: "/images/avatar/4.png" },
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
    author: { name: "Maya", image: "/images/avatar/5.png" },
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
    author: { name: "Alice", image: "/images/avatar/1.png" },
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
    author: { name: "Jeet", image: "/images/avatar/2.png" },
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
    author: { name: "Priya", image: "/images/avatar/6.png" },
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
    author: { name: "Omar", image: "/images/avatar/7.png" },
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
    author: { name: "Lina", image: "/images/avatar/8.png" },
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
    author: { name: "Chen", image: "/images/avatar/9.png" },
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
    author: { name: "Zoe", image: "/images/avatar/10.png" },
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
    author: { name: "Sam", image: "/images/avatar/4.png" },
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
    author: { name: "Alice", image: "/images/avatar/1.png" },
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
    author: { name: "Jeet", image: "/images/avatar/2.png" },
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
    author: { name: "Priya", image: "/images/avatar/6.png" },
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
    author: { name: "Ryan", image: "/images/avatar/3.png" },
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
    author: { name: "Maya", image: "/images/avatar/5.png" },
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
    author: { name: "Omar", image: "/images/avatar/7.png" },
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
    author: { name: "Lina", image: "/images/avatar/8.png" },
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
    author: { name: "Zoe", image: "/images/avatar/10.png" },
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
    author: { name: "Sam", image: "/images/avatar/4.png" },
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
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message:
      "Large message: I spent the morning reviewing the legacy importer — there are subtle differences in CSV column order across clients which can corrupt data mapping. I propose a two-step ingest: schema detection + strict validation step that rejects ambiguous rows with a detailed report back to the client. This will add a bit of latency but save us from silent data corruption.",
    timestamp: "2025-12-08T10:10:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 6, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m15",
    author: { name: "Priya", image: "/images/avatar/6.png" },
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
    author: { name: "Ryan", image: "/images/avatar/3.png" },
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
    author: { name: "Omar", image: "/images/avatar/7.png" },
    message:
      "Long note: I experimented with a client-side caching layer for frequently requested meta endpoints. The POC reduces API calls by ~40% on repeated navigation flows. We should evaluate cache invalidation rules carefully (short TTL, and conditional revalidation on major updates). Attached graphs show request counts before/after.",
    timestamp: "2025-12-08T10:20:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/3.png", "/images/servers/5.png"],
    reactions: { like: 5, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m17",
    author: { name: "Lina", image: "/images/avatar/8.png" },
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
    author: { name: "Chen", image: "/images/avatar/9.png" },
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
    author: { name: "Maya", image: "/images/avatar/5.png" },
    message: "If you want, I can help run the benchmark and produce a before/after for the PR.",
    timestamp: "2025-12-08T10:29:00Z",
    isReply: true,
    messageId: "m18",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m19",
    author: { name: "Zoe", image: "/images/avatar/10.png" },
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
    author: { name: "Alice", image: "/images/avatar/1.png" },
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
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Checked on Android and iOS — looks good and feels better to tap. Approved.",
    timestamp: "2025-12-08T10:42:00Z",
    isReply: true,
    messageId: "m20",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m21",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
    message:
      "Thoughtful: for the next sprint, let's prioritize crash-free sessions and improve our end-to-end tests. We had a couple of regressions that unit tests didn't catch. I'll prepare scenarios for Cypress to cover common flows.",
    timestamp: "2025-12-08T10:45:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/2.png"],
    reactions: { like: 6, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m22",
    author: { name: "Priya", image: "/images/avatar/6.png" },
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
    author: { name: "Omar", image: "/images/avatar/7.png" },
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
    author: { name: "Lina", image: "/images/avatar/8.png" },
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
    author: { name: "Chen", image: "/images/avatar/9.png" },
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
    author: { name: "Maya", image: "/images/avatar/5.png" },
    message:
      "Thanks — the alert on worker queue depth was noisy earlier; a short suppression window helped. I'll report any further noise.",
    timestamp: "2025-12-08T11:07:00Z",
    isReply: true,
    messageId: "m25",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m26",
    author: { name: "Zoe", image: "/images/avatar/10.png" },
    message:
      "Long message: the content team wants an export of weekly user engagement for the past quarter, broken down by cohort and source. It will take a small analytics job; can the team estimate runtime and any DB impact?",
    timestamp: "2025-12-08T11:10:00Z",
    isReply: false,
    messageId: null,
    images: ["/images/servers/4.png", "/images/servers/1.png"],
    reactions: { like: 3, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m26_r1",
    author: { name: "Jeet", image: "/images/avatar/2.png" },
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
    author: { name: "Priya", image: "/images/avatar/6.png" },
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
    author: { name: "Omar", image: "/images/avatar/7.png" },
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
    author: { name: "Lina", image: "/images/avatar/8.png" },
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
    author: { name: "Sam", image: "/images/avatar/4.png" },
    message: "Agree — increased it and verified on a device; will push the change shortly.",
    timestamp: "2025-12-08T11:32:00Z",
    isReply: true,
    messageId: "m29",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m30",
    author: { name: "Chen", image: "/images/avatar/9.png" },
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
    author: { name: "Maya", image: "/images/avatar/5.png" },
    message:
      "Long reply: regarding analytics quality, I recommend adding a schema validation step client-side before sending events — it dramatically reduces malformed events and simplifies pipeline processing. I can prototype this as a tiny library next sprint.",
    timestamp: "2025-12-08T11:40:00Z",
    isReply: false,
    messageId: null,
    images: [],
    reactions: { like: 4, love: 1, laugh: 0, angry: 0 }
  },
  {
    id: "m32",
    author: { name: "Zoe", image: "/images/avatar/10.png" },
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
    author: { name: "Jeet", image: "/images/avatar/2.png" },
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
    author: { name: "Priya", image: "/images/avatar/6.png" },
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
    author: { name: "Ryan", image: "/images/avatar/3.png" },
    message: "I'll prioritize the dependency PR and include a short changelog entry for the patch.",
    timestamp: "2025-12-08T11:58:00Z",
    isReply: true,
    messageId: "m34",
    images: [],
    reactions: { like: 2, love: 0, laugh: 0, angry: 0 }
  },
  {
    id: "m35",
    author: { name: "Omar", image: "/images/avatar/7.png" },
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
    author: { name: "Lina", image: "/images/avatar/8.png" },
    message:
      "I can take the first shift on Saturday. Please share the runbook and any important contacts.",
    timestamp: "2025-12-08T12:03:00Z",
    isReply: true,
    messageId: "m35",
    images: [],
    reactions: { like: 1, love: 0, laugh: 0, angry: 0 }
  }
];

function getMessageById(id) {
  return chats.find((chat) => chat.id === id);
}
</script>
