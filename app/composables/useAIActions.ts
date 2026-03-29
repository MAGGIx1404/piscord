export interface ActionResult {
  content: string;
  latency_ms: number;
  model: string;
}

export interface CompareResult {
  perspectives: Array<{ label: string; content: string }>;
  latency_ms: number;
}

export function useAIActions() {
  const api = useApi();
  const loading = ref(false);

  async function runAction(text: string, action: string, persona?: string): Promise<ActionResult> {
    loading.value = true;
    try {
      return await api<ActionResult>("/api/ai/action", {
        method: "POST",
        body: { text, action, persona }
      });
    } finally {
      loading.value = false;
    }
  }

  async function runCompare(prompt: string): Promise<CompareResult> {
    loading.value = true;
    try {
      return await api<CompareResult>("/api/ai/compare", {
        method: "POST",
        body: { prompt }
      });
    } finally {
      loading.value = false;
    }
  }

  return { loading, runAction, runCompare };
}
