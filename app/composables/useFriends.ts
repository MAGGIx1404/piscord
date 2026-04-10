import { toast } from "vue-sonner";

export interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  request_id: string;
  created_at: string;
  is_online: boolean;
}

export interface FriendRequestUser {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  avatar_url: string | null;
  friendship_status: string | null;
  is_incoming: boolean;
}

export function useFriends() {
  const api = useApi();

  const friends = ref<Friend[]>([]);
  const incomingRequests = ref<FriendRequestUser[]>([]);
  const outgoingRequests = ref<FriendRequestUser[]>([]);
  const searchResults = ref<UserSearchResult[]>([]);
  const loadingFriends = ref(true);
  const loadingRequests = ref(true);
  const searchLoading = ref(false);

  async function fetchFriends() {
    loadingFriends.value = true;
    try {
      const data = await api<{ friends: Friend[] }>("/api/friends");
      friends.value = data.friends;
    } finally {
      loadingFriends.value = false;
    }
  }

  async function fetchRequests() {
    loadingRequests.value = true;
    try {
      const data = await api<{
        incoming: FriendRequestUser[];
        outgoing: FriendRequestUser[];
      }>("/api/friends/requests");
      incomingRequests.value = data.incoming;
      outgoingRequests.value = data.outgoing;
    } finally {
      loadingRequests.value = false;
    }
  }

  async function sendRequest(receiverId: string) {
    try {
      await api("/api/friends/requests", {
        method: "POST",
        body: { receiverId }
      });
      toast.success("Friend request sent!");
      await fetchRequests();
    } catch (e: any) {
      const msg = e?.data?.message ?? "Failed to send friend request";
      if (e?.status === 409 || e?.statusCode === 409) {
        toast.info(msg);
      } else {
        toast.error(msg);
      }
    }
  }

  async function acceptRequest(requestId: string) {
    try {
      await api(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        body: { action: "accept" }
      });
      toast.success("Friend request accepted!");
      await Promise.all([fetchFriends(), fetchRequests()]);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to accept request");
    }
  }

  async function declineRequest(requestId: string) {
    try {
      await api(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        body: { action: "decline" }
      });
      toast.success("Friend request declined");
      await fetchRequests();
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to decline request");
    }
  }

  async function cancelRequest(requestId: string) {
    try {
      await api(`/api/friends/requests/${requestId}`, {
        method: "DELETE"
      });
      toast.success("Friend request cancelled");
      await fetchRequests();
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to cancel request");
    }
  }

  async function removeFriend(friendId: string) {
    try {
      await api(`/api/friends/${friendId}`, {
        method: "DELETE"
      });
      toast.success("Friend removed");
      await fetchFriends();
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to remove friend");
    }
  }

  async function searchUsers(query: string) {
    if (query.length < 2) {
      searchResults.value = [];
      searchLoading.value = false;
      return;
    }
    searchLoading.value = true;
    try {
      const data = await api<{ users: UserSearchResult[] }>("/api/users/search", {
        query: { q: query }
      });
      searchResults.value = data.users;
    } catch {
      searchResults.value = [];
    } finally {
      searchLoading.value = false;
    }
  }

  let unsubscribe: (() => void) | null = null;

  function listenRealtime() {
    if (unsubscribe) return;
    const { onMessage } = useUserSocket();
    unsubscribe = onMessage((data) => {
      switch (data.type) {
        case "friend:online": {
          const userId = data.userId as string;
          const f = friends.value.find((fr) => fr.id === userId);
          if (f) f.is_online = true;
          break;
        }

        case "friend:offline": {
          const userId = data.userId as string;
          const f = friends.value.find((fr) => fr.id === userId);
          if (f) f.is_online = false;
          break;
        }

        case "friend:request": {
          const req = data.request as FriendRequestUser;
          if (!incomingRequests.value.find((r) => r.id === req.id)) {
            incomingRequests.value.unshift(req);
          }
          break;
        }

        case "friend:accepted": {
          fetchFriends();
          fetchRequests();
          break;
        }
      }
    });
  }

  function stopRealtime() {
    unsubscribe?.();
    unsubscribe = null;
  }

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    loadingFriends,
    loadingRequests,
    searchLoading,
    fetchFriends,
    fetchRequests,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    removeFriend,
    searchUsers,
    listenRealtime,
    stopRealtime
  };
}
