import type { MemoryItem } from "~/stores/workspace";

export function useWorkspaceMemory(communityId: string, workspaceId: string) {
  const api = useApi();
  const store = useWorkspaceStore();
  const basePath = `/api/communities/${communityId}/workspaces/${workspaceId}/memory`;

  async function loadMemories() {
    try {
      const items = await api<MemoryItem[]>(basePath);
      store.setMemories(items);
    } catch {
      store.setMemories([]);
    }
  }

  async function addMemory(content: string, type: string = "note") {
    const item = await api<MemoryItem>(basePath, {
      method: "POST",
      body: { content, type }
    });
    store.addMemoryItem(item);
    return item;
  }

  async function removeMemory(id: string) {
    await api(`${basePath}/${id}`, { method: "DELETE" });
    store.removeMemoryItem(id);
  }

  return { loadMemories, addMemory, removeMemory };
}
