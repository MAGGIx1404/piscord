import { puter } from "@heyputer/puter.js";

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

export function usePuterModels() {
  const models = ref<AIModel[]>([]);
  const loading = ref(false);

  async function load() {
    if (models.value.length) return;
    loading.value = true;
    try {
      const puterModels = await puter.ai.listModels();
      models.value = (puterModels || []).map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        provider: m.provider || "unknown"
      }));
    } finally {
      loading.value = false;
    }
  }

  return { models, loading, load };
}
