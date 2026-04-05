import { ref, onUnmounted } from "vue";

export interface VoiceParticipant {
  userId: string;
  username: string;
  avatarUrl: string | null;
  isMuted: boolean;
  isSpeaking: boolean;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
};

const SPEAKING_THRESHOLD = 30;
const SPEAKING_CHECK_INTERVAL = 100;

export function useVoiceChannel(channelId: Ref<string>) {
  const userStore = useUserStore();

  const joined = ref(false);
  const connecting = ref(false);
  const isMuted = ref(false);
  const participants = ref<VoiceParticipant[]>([]);
  const speakingUsers = ref<Set<string>>(new Set());

  // Reaction callback — set by the page component to handle incoming reactions
  let reactionHandler: ((userId: string, emoji: string) => void) | null = null;
  function onReaction(handler: (userId: string, emoji: string) => void) {
    reactionHandler = handler;
  }

  let ws: WebSocket | null = null;
  let localStream: MediaStream | null = null;
  const peerConnections = new Map<string, RTCPeerConnection>();
  const remoteAudioElements = new Map<string, HTMLAudioElement>();
  let audioContext: AudioContext | null = null;
  let analyserMap = new Map<
    string,
    { analyser: AnalyserNode; source: MediaStreamAudioSourceNode }
  >();
  let speakingInterval: ReturnType<typeof setInterval> | null = null;
  let memberCache = new Map<string, { username: string; avatarUrl: string | null }>();

  async function fetchMembers() {
    const api = useApi();
    try {
      const data = await api<{
        members: Array<{ id: string; username: string; avatar_url: string | null }>;
      }>(`/api/channels/${channelId.value}/members`);
      for (const m of data.members) {
        memberCache.set(m.id, { username: m.username, avatarUrl: m.avatar_url });
      }
    } catch {
      // Non-critical, we'll fall back to userId display
    }
  }

  function getMemberInfo(userId: string) {
    return memberCache.get(userId) ?? { username: userId.slice(0, 8), avatarUrl: null };
  }

  function updateParticipantsList(userIds: string[]) {
    const myId = userStore.user?.id;
    participants.value = userIds.map((uid) => {
      const existing = participants.value.find((p) => p.userId === uid);
      const info = getMemberInfo(uid);
      return {
        userId: uid,
        username: info.username,
        avatarUrl: info.avatarUrl,
        isMuted: uid === myId ? isMuted.value : (existing?.isMuted ?? false),
        isSpeaking: speakingUsers.value.has(uid)
      };
    });
  }

  async function join() {
    if (joined.value || connecting.value) return;
    connecting.value = true;

    try {
      await fetchMembers();

      // Request microphone — requires secure context (HTTPS or localhost)
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "INSECURE_CONTEXT: Microphone access requires HTTPS. Use an HTTPS tunnel or localhost."
        );
      }

      localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      // Set up local audio analysis for speaking detection
      audioContext = new AudioContext();
      setupLocalSpeakingDetection();

      // Connect WebSocket for signaling and wait for it to be ready
      await connectSignaling();
    } catch (err) {
      connecting.value = false;
      cleanup();
      throw err;
    }
  }

  function connectSignaling(): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/_ws`;

      ws = new WebSocket(wsUrl);

      // Timeout — if connection doesn't establish in 10s, fail
      const timeout = setTimeout(() => {
        reject(new Error("TIMEOUT: Voice signaling connection timed out."));
        ws?.close();
      }, 10000);

      let resolved = false;

      ws.onopen = () => {
        ws?.send(
          JSON.stringify({
            type: "auth",
            channelId: channelId.value
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Resolve the promise once we get auth:success (signaling is ready)
        if (!resolved && data.type === "auth:success") {
          resolved = true;
          clearTimeout(timeout);
          resolve();
        }

        handleSignalingMessage(data);
      };

      ws.onclose = () => {
        if (!resolved) {
          clearTimeout(timeout);
          reject(new Error("WS_CLOSED: WebSocket closed before authentication."));
          return;
        }
        if (joined.value) {
          // Unexpected disconnect — try to reconnect
          setTimeout(() => {
            if (joined.value) connectSignaling();
          }, 3000);
        }
      };

      ws.onerror = () => {
        if (!resolved) {
          clearTimeout(timeout);
          reject(new Error("WS_ERROR: Failed to connect to voice signaling server."));
        }
        connecting.value = false;
      };
    });
  }

  async function handleSignalingMessage(data: Record<string, unknown>) {
    switch (data.type) {
      case "auth:success": {
        // Authenticated — now join the voice room
        ws?.send(JSON.stringify({ type: "voice:join" }));
        break;
      }

      case "voice:participants": {
        // Initial participant list — create peer connections to each existing user
        const userIds = data.participants as string[];
        const myId = userStore.user?.id;
        updateParticipantsList(userIds);

        joined.value = true;
        connecting.value = false;

        // Create offers to all existing participants (we are the newcomer)
        for (const uid of userIds) {
          if (uid !== myId) {
            await createPeerConnection(uid, true);
          }
        }
        break;
      }

      case "voice:user-joined": {
        const userId = data.userId as string;
        const allParticipants = data.participants as string[];
        updateParticipantsList(allParticipants);
        // Don't create offer — the newcomer will send us an offer
        break;
      }

      case "voice:user-left": {
        const userId = data.userId as string;
        const allParticipants = data.participants as string[];
        closePeerConnection(userId);
        updateParticipantsList(allParticipants);
        break;
      }

      case "voice:offer": {
        const fromUserId = data.fromUserId as string;
        const offer = data.offer as RTCSessionDescriptionInit;
        await handleOffer(fromUserId, offer);
        break;
      }

      case "voice:answer": {
        const fromUserId = data.fromUserId as string;
        const answer = data.answer as RTCSessionDescriptionInit;
        await handleAnswer(fromUserId, answer);
        break;
      }

      case "voice:ice-candidate": {
        const fromUserId = data.fromUserId as string;
        const candidate = data.candidate as RTCIceCandidateInit;
        await handleIceCandidate(fromUserId, candidate);
        break;
      }

      case "voice:reaction": {
        const userId = data.userId as string;
        const emoji = data.emoji as string;
        if (reactionHandler) reactionHandler(userId, emoji);
        break;
      }
    }
  }

  async function createPeerConnection(remoteUserId: string, createOffer: boolean) {
    // Close existing connection if any
    closePeerConnection(remoteUserId);

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnections.set(remoteUserId, pc);

    // Add local audio tracks
    if (localStream) {
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }
    }

    // Handle remote audio stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        playRemoteAudio(remoteUserId, remoteStream);
        setupRemoteSpeakingDetection(remoteUserId, remoteStream);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws?.send(
          JSON.stringify({
            type: "voice:ice-candidate",
            targetUserId: remoteUserId,
            candidate: event.candidate.toJSON()
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        // Try to renegotiate
        closePeerConnection(remoteUserId);
      }
    };

    if (createOffer) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws?.send(
        JSON.stringify({
          type: "voice:offer",
          targetUserId: remoteUserId,
          offer: pc.localDescription
        })
      );
    }

    return pc;
  }

  async function handleOffer(fromUserId: string, offer: RTCSessionDescriptionInit) {
    const pc = await createPeerConnection(fromUserId, false);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws?.send(
      JSON.stringify({
        type: "voice:answer",
        targetUserId: fromUserId,
        answer: pc.localDescription
      })
    );
  }

  async function handleAnswer(fromUserId: string, answer: RTCSessionDescriptionInit) {
    const pc = peerConnections.get(fromUserId);
    if (pc && pc.signalingState === "have-local-offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async function handleIceCandidate(fromUserId: string, candidate: RTCIceCandidateInit) {
    const pc = peerConnections.get(fromUserId);
    if (pc && pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  function playRemoteAudio(userId: string, stream: MediaStream) {
    // Remove old element
    const oldEl = remoteAudioElements.get(userId);
    if (oldEl) {
      oldEl.srcObject = null;
      oldEl.remove();
    }

    const audio = document.createElement("audio");
    audio.autoplay = true;
    audio.srcObject = stream;
    // Append to DOM (required for autoplay in some browsers)
    audio.style.display = "none";
    document.body.appendChild(audio);
    remoteAudioElements.set(userId, audio);
  }

  function closePeerConnection(userId: string) {
    const pc = peerConnections.get(userId);
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peerConnections.delete(userId);
    }

    const audio = remoteAudioElements.get(userId);
    if (audio) {
      audio.srcObject = null;
      audio.remove();
      remoteAudioElements.delete(userId);
    }

    const analyserEntry = analyserMap.get(userId);
    if (analyserEntry) {
      analyserEntry.source.disconnect();
      analyserMap.delete(userId);
    }

    speakingUsers.value.delete(userId);
  }

  // ── Speaking Detection ──

  function setupLocalSpeakingDetection() {
    if (!audioContext || !localStream) return;
    const myId = userStore.user?.id;
    if (!myId) return;

    const source = audioContext.createMediaStreamSource(localStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserMap.set(myId, { analyser, source });

    startSpeakingDetection();
  }

  function setupRemoteSpeakingDetection(userId: string, stream: MediaStream) {
    if (!audioContext) return;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserMap.set(userId, { analyser, source });
  }

  function startSpeakingDetection() {
    if (speakingInterval) return;

    speakingInterval = setInterval(() => {
      const newSpeaking = new Set<string>();

      for (const [userId, { analyser }] of analyserMap) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, val) => sum + val, 0) / data.length;

        if (average > SPEAKING_THRESHOLD) {
          newSpeaking.add(userId);
        }
      }

      // Only update if changed
      const oldSet = speakingUsers.value;
      if (newSpeaking.size !== oldSet.size || [...newSpeaking].some((id) => !oldSet.has(id))) {
        speakingUsers.value = newSpeaking;
        // Update participants speaking state
        for (const p of participants.value) {
          p.isSpeaking = newSpeaking.has(p.userId);
        }
      }
    }, SPEAKING_CHECK_INTERVAL);
  }

  function sendReaction(emoji: string) {
    ws?.send(JSON.stringify({ type: "voice:reaction", emoji }));
  }

  // ── Mute / Unmute ──

  function toggleMute() {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    isMuted.value = !isMuted.value;
    audioTrack.enabled = !isMuted.value;

    // Update own participant entry
    const myId = userStore.user?.id;
    const me = participants.value.find((p) => p.userId === myId);
    if (me) me.isMuted = isMuted.value;
  }

  // ── Leave / Cleanup ──

  function leave() {
    if (!joined.value) return;
    joined.value = false;

    // Notify server
    ws?.send(JSON.stringify({ type: "voice:leave" }));

    cleanup();
  }

  function cleanup() {
    // Close all peer connections
    for (const userId of peerConnections.keys()) {
      closePeerConnection(userId);
    }
    peerConnections.clear();

    // Stop local media tracks
    if (localStream) {
      for (const track of localStream.getTracks()) {
        track.stop();
      }
      localStream = null;
    }

    // Stop speaking detection
    if (speakingInterval) {
      clearInterval(speakingInterval);
      speakingInterval = null;
    }

    // Close audio context
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    analyserMap.clear();

    // Clean up audio elements
    for (const audio of remoteAudioElements.values()) {
      audio.srcObject = null;
      audio.remove();
    }
    remoteAudioElements.clear();

    // Close WebSocket
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }

    speakingUsers.value = new Set();
    participants.value = [];
    isMuted.value = false;
    connecting.value = false;
  }

  onUnmounted(() => {
    if (joined.value) leave();
    else cleanup();
  });

  return {
    joined,
    connecting,
    isMuted,
    participants,
    speakingUsers,
    join,
    leave,
    toggleMute,
    sendReaction,
    onReaction,
    getMemberInfo
  };
}
