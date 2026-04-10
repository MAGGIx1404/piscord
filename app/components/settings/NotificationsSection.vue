<template>
  <div>
    <SettingsCard
      title="Push notifications"
      description="Control what you get notified about in real time."
    >
      <div class="space-y-5">
        <SettingsNotifRow
          label="Direct messages"
          description="New messages from friends and DMs."
          v-model="notifs.directMessages"
        />
        <Separator />
        <SettingsNotifRow
          label="Mentions"
          description="When someone @mentions you in a channel."
          v-model="notifs.mentions"
        />
        <Separator />
        <SettingsNotifRow
          label="Community activity"
          description="Announcements and updates from your communities."
          v-model="notifs.communityActivity"
        />
        <Separator />
        <SettingsNotifRow
          label="Friend requests"
          description="When someone sends you a friend request."
          v-model="notifs.friendRequests"
        />
        <Separator />
        <SettingsNotifRow
          label="Role assignments"
          description="When a moderator assigns or removes a role."
          v-model="notifs.roleChanges"
        />
      </div>
    </SettingsCard>

    <SettingsCard
      title="Email notifications"
      description="Choose which updates are sent to your email."
      class="mt-6"
    >
      <div class="space-y-5">
        <SettingsNotifRow
          label="Security alerts"
          description="Unusual sign-ins or password changes."
          v-model="notifs.emailSecurity"
          :locked="true"
        />
        <Separator />
        <SettingsNotifRow
          label="Product updates"
          description="New features and platform announcements."
          v-model="notifs.emailUpdates"
        />
        <Separator />
        <SettingsNotifRow
          label="Community digests"
          description="Weekly summary of activity in your communities."
          v-model="notifs.emailDigests"
        />
      </div>
    </SettingsCard>

    <SettingsCard
      title="Do not disturb"
      description="Mute all notifications for a period of time."
      class="mt-6"
    >
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="opt in dndOptions"
          :key="opt.value"
          size="sm"
          :variant="dndActive === opt.value ? 'default' : 'outline'"
          @click="setDnd(opt.value)"
        >
          {{ opt.label }}
        </Button>
      </div>
      <p v-if="dndActive" class="mt-3 text-xs text-muted-foreground">
        Notifications muted until {{ dndUntil }}.
      </p>
    </SettingsCard>

    <div class="mt-6 flex justify-end">
      <Button :disabled="savingNotifs" @click="saveNotifications">
        <Loader2 v-if="savingNotifs" class="mr-2 size-4 animate-spin" />
        Save preferences
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";

const notifs = reactive({
  directMessages: true,
  mentions: true,
  communityActivity: false,
  friendRequests: true,
  roleChanges: false,
  emailSecurity: true,
  emailUpdates: false,
  emailDigests: false
});

const savingNotifs = ref(false);
async function saveNotifications() {
  savingNotifs.value = true;
  await new Promise((r) => setTimeout(r, 600));
  savingNotifs.value = false;
  toast.success("Notification preferences saved.");
}

const dndOptions = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "4 hours", value: 240 },
  { label: "Until tomorrow", value: 960 },
  { label: "Off", value: 0 }
];
const dndActive = ref(0);
const dndUntil = computed(() => {
  if (!dndActive.value) return "";
  const d = new Date(Date.now() + dndActive.value * 60_000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
});

function setDnd(mins: number) {
  dndActive.value = mins;
}
</script>
