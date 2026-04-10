# Voice Channel System — Architecture & Design

Real-time voice communication system built on WebRTC with peer-to-peer audio streaming, using the existing Nuxt 4 native WebSocket infrastructure for signaling.

---

## Overview

- **WebRTC** for peer-to-peer audio (no media server)
- **Existing `_ws.ts` WebSocket handler** for signaling (no Socket.IO)
- **Mesh topology** — each user connects directly to every other user
- **Optimized for 2–10 users** per voice channel
- **No external paid services** — uses free Google STUN servers for NAT traversal

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                      Browser A                       │
│  useVoiceChannel() → getUserMedia → RTCPeerConnection │
│        ↕ WebSocket (existing _ws.ts)                 │
└───────────────────────┬──────────────────────────────┘
                        │ voice:join / offer / answer / ice-candidate
                        ▼
┌──────────────────────────────────────────────────────┐
│               Signaling Server (_ws.ts)              │
│   voiceParticipants Map → relay to target peer       │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                      Browser B                       │
│  useVoiceChannel() → RTCPeerConnection ←→ Browser A  │
│        Audio streams flow P2P (not through server)   │
└──────────────────────────────────────────────────────┘
```

Audio streams are **never routed through the server** — only signaling messages pass through the WebSocket.

---

## System Components

### 1. Signaling Server (`server/routes/_ws.ts`)

Extends the existing WebSocket handler with voice-specific events and state tracking.

**Server-side state:**

| Structure | Purpose |
|-----------|---------|
| `voiceParticipants: Map<channelId, Set<userId>>` | Tracks who is currently in each voice room |
| `sendToPeerByUserId(channelId, targetUserId, data)` | Routes signaling messages to a specific user's WebSocket peer |

### 2. WebRTC Composable (`app/composables/useVoiceChannel.ts`)

Manages the full lifecycle: microphone access, WebSocket signaling, peer connections, audio playback, and speaking detection.

**Exposed state:**

| Ref | Type | Description |
|-----|------|-------------|
| `joined` | `boolean` | Whether the user is in the voice room |
| `connecting` | `boolean` | Connection in progress |
| `isMuted` | `boolean` | Local mute state |
| `participants` | `VoiceParticipant[]` | All users in the room with metadata |
| `speakingUsers` | `Set<string>` | User IDs currently speaking |

**Exposed methods:**

| Method | Description |
|--------|-------------|
| `join()` | Request mic, connect signaling, join room |
| `leave()` | Close all connections, stop media, notify server |
| `toggleMute()` | Toggle local audio track on/off |

### 3. Vue Components

| Component | Purpose |
|-----------|---------|
| `ChannelVoiceRoom.vue` | Full voice room UI — join screen, participant grid, call controls |
| `VoiceParticipant.vue` | Individual participant card with avatar, name, mute/speaking indicators |

### 4. Channel Page Integration (`app/pages/community/[community_id]/channels/[channel_id]/index.vue`)

When `channelType === 'voice'`, renders `ChannelVoiceRoom` instead of the text chat UI.

---

## Event Flow

### Join Flow

```
User clicks "Join Voice"
    │
    ▼
getUserMedia({ audio: true })          ← Request microphone
    │
    ▼
new WebSocket(/_ws)                     ← Connect to signaling
    │
    ▼
send({ type: "auth", channelId })      ← Authenticate
    │
    ▼
receive "auth:success"
    │
    ▼
send({ type: "voice:join" })           ← Join voice room
    │
    ▼
receive "voice:participants"            ← Server sends existing user list
    │
    ├─ For each existing user:
    │     createPeerConnection(userId, createOffer=true)
    │     │
    │     ▼
    │     send({ type: "voice:offer", targetUserId, offer })
    │     │
    │     ▼
    │     receive "voice:answer" from that user
    │     │
    │     ▼
    │     Exchange ICE candidates (voice:ice-candidate)
    │     │
    │     ▼
    │     Audio streaming begins (P2P)
    │
    ▼
Server broadcasts "voice:user-joined" to others
```

### Offer / Answer Exchange

```
Newcomer (A)                    Existing User (B)
    │                                │
    ├── voice:offer ──────────────► │
    │                                ├── createPeerConnection(A, false)
    │                                ├── setRemoteDescription(offer)
    │                                ├── createAnswer()
    │ ◄────────── voice:answer ─────┤
    ├── setRemoteDescription(answer) │
    │                                │
    ├── voice:ice-candidate ──────► │
    │ ◄── voice:ice-candidate ──────┤
    │         ...                    │
    ▼                                ▼
    P2P audio connected
```

### Leave Flow

```
User clicks "Leave" or navigates away
    │
    ▼
send({ type: "voice:leave" })
    │
    ├── Close all RTCPeerConnections
    ├── Stop all local media tracks
    ├── Close AudioContext + analysers
    ├── Remove hidden <audio> elements
    └── Close WebSocket
    │
    ▼
Server removes user from voiceParticipants
Server broadcasts "voice:user-left" to remaining users
    │
    ▼
Other peers close the connection to the departed user
```

---

## Signaling Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `voice:join` | — | Join the voice room for the authenticated channel |
| `voice:leave` | — | Leave the voice room |
| `voice:offer` | `{ targetUserId, offer }` | Send WebRTC offer to a specific user |
| `voice:answer` | `{ targetUserId, answer }` | Send WebRTC answer to a specific user |
| `voice:ice-candidate` | `{ targetUserId, candidate }` | Send ICE candidate to a specific user |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `voice:participants` | `{ participants: string[] }` | Sent to newcomer with list of current user IDs |
| `voice:user-joined` | `{ userId, participants }` | Broadcast when a new user joins |
| `voice:user-left` | `{ userId, participants }` | Broadcast when a user leaves or disconnects |
| `voice:offer` | `{ fromUserId, offer }` | Relayed offer from another user |
| `voice:answer` | `{ fromUserId, answer }` | Relayed answer from another user |
| `voice:ice-candidate` | `{ fromUserId, candidate }` | Relayed ICE candidate from another user |

---

## Features

### Mute / Unmute

```typescript
localStream.getAudioTracks()[0].enabled = false; // mute
localStream.getAudioTracks()[0].enabled = true;  // unmute
```

Toggling the track's `enabled` property stops sending audio data without renegotiating the peer connection.

### Active Speaker Detection

Uses the **Web Audio API** `AnalyserNode` to measure volume levels:

1. Each audio stream (local + remote) is connected to an `AnalyserNode`
2. Every 100ms, `getByteFrequencyData()` computes average volume
3. If average exceeds threshold (30), the user is marked as speaking
4. The UI shows a green ring pulse animation around the speaking user's avatar

### Auto-Cleanup on Disconnect

If a user's WebSocket disconnects unexpectedly (browser crash, network loss):

1. Server detects the `close` event
2. Removes user from `voiceParticipants` map
3. Broadcasts `voice:user-left` to remaining peers
4. Other peers close the corresponding `RTCPeerConnection`

### Audio Configuration

```typescript
getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
})
```

### ICE / STUN Configuration

```typescript
{
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
}
```

Free Google STUN servers for NAT traversal. For production behind symmetric NATs, a TURN server would be needed.

---

## Performance Considerations

- **Mesh limit**: Each peer maintains N-1 connections. At 10 users, that's 9 connections per user (45 total). Beyond 10, consider an SFU.
- **Cleanup**: All peer connections, media tracks, audio elements, and analysers are properly closed on leave/disconnect.
- **Reconnection**: WebSocket auto-reconnects after 3 seconds on unexpected close.
- **Memory**: Hidden `<audio>` elements are removed from DOM on cleanup. `AudioContext` is closed to free resources.

---

## File Reference

| File | Role |
|------|------|
| `server/routes/_ws.ts` | Signaling server — voice events + participant tracking |
| `app/composables/useVoiceChannel.ts` | WebRTC mesh composable |
| `app/components/channel/ChannelVoiceRoom.vue` | Voice room UI |
| `app/components/channel/VoiceParticipant.vue` | Participant card component |
| `app/pages/community/[community_id]/channels/[channel_id]/index.vue` | Channel page (routes voice type to voice room) |
