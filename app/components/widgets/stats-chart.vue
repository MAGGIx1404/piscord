<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart";
import { VisArea, VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartCrosshair,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Users, MessageSquare, UserPlus, Hash, TrendingUp, TrendingDown } from "lucide-vue-next";

interface Props {
  title?: string;
  description?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Community Stats",
  description: "Activity overview showing members, messages, and engagement metrics."
});

// Generate chart data for the last 90 days
const generateChartData = () => {
  const data = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date,
      members: Math.floor(Math.random() * 150) + 50 + Math.sin(i / 10) * 30,
      messages: Math.floor(Math.random() * 500) + 200 + Math.cos(i / 8) * 100,
      newMembers: Math.floor(Math.random() * 30) + 5,
      activeChannels: Math.floor(Math.random() * 15) + 20
    });
  }
  return data;
};

const chartData = generateChartData();
type Data = (typeof chartData)[number];

const chartConfig = {
  members: {
    label: "Online Members",
    color: "hsl(142, 76%, 45%)" // green
  },
  messages: {
    label: "Messages",
    color: "hsl(217, 91%, 60%)" // blue
  },
  newMembers: {
    label: "New Members",
    color: "hsl(262, 83%, 58%)" // purple
  },
  activeChannels: {
    label: "Active Channels",
    color: "hsl(38, 92%, 50%)" // amber
  }
} satisfies ChartConfig;

const timeRange = ref("30d");
const selectedMetric = ref("members");

const filterRange = computed(() => {
  let daysToSubtract = 30;
  if (timeRange.value === "90d") {
    daysToSubtract = 90;
  } else if (timeRange.value === "7d") {
    daysToSubtract = 7;
  }
  return chartData.slice(-daysToSubtract);
});

// Calculate stats from data
const stats = computed(() => {
  const data = filterRange.value;
  const prevData = chartData.slice(-data.length * 2, -data.length);

  const sumCurrent = (key: keyof Data) => data.reduce((sum, d) => sum + (d[key] as number), 0);
  const sumPrev = (key: keyof Data) => prevData.reduce((sum, d) => sum + (d[key] as number), 0);
  const avgCurrent = (key: keyof Data) => Math.round(sumCurrent(key) / data.length);
  const avgPrev = (key: keyof Data) => Math.round(sumPrev(key) / (prevData.length || 1));

  const calcTrend = (key: keyof Data) => {
    const curr = avgCurrent(key);
    const prev = avgPrev(key) || 1;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return [
    {
      label: "Avg Online",
      value: avgCurrent("members").toLocaleString(),
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      trend: calcTrend("members")
    },
    {
      label: "Total Messages",
      value: sumCurrent("messages").toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      trend: calcTrend("messages")
    },
    {
      label: "New Members",
      value: sumCurrent("newMembers").toLocaleString(),
      icon: UserPlus,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      trend: calcTrend("newMembers")
    },
    {
      label: "Active Channels",
      value: avgCurrent("activeChannels").toLocaleString(),
      icon: Hash,
      color: "text-amber-500",
      bgColor: "bg-amber-500/20",
      trend: calcTrend("activeChannels")
    }
  ];
});

const metricOptions = [
  { value: "members", label: "Online Members", color: "hsl(142, 76%, 45%)" },
  { value: "messages", label: "Messages", color: "hsl(217, 91%, 60%)" },
  { value: "newMembers", label: "New Members", color: "hsl(262, 83%, 58%)" },
  { value: "activeChannels", label: "Active Channels", color: "hsl(38, 92%, 50%)" }
];

const currentMetricColor = computed(() => {
  return metricOptions.find((m) => m.value === selectedMetric.value)?.color || "hsl(142, 76%, 45%)";
});

const currentSvgDefs = computed(() => {
  const color = currentMetricColor.value;
  return `
    <linearGradient id="fillStats" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stop-color="${color}" stop-opacity="0.8" />
      <stop offset="95%" stop-color="${color}" stop-opacity="0.1" />
    </linearGradient>
  `;
});
</script>

<template>
  <Card class="pt-0">
    <CardHeader class="flex items-center gap-2 border-b pt-6 px-2 sm:flex-row">
      <div class="grid flex-1 gap-1">
        <CardTitle>{{ title }}</CardTitle>
        <CardDescription>{{ description }}</CardDescription>
      </div>
      <div class="flex gap-2">
        <Select v-model="selectedMetric">
          <SelectTrigger class="w-40 rounded-lg" aria-label="Select metric">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent class="rounded-xl">
            <SelectItem
              v-for="option in metricOptions"
              :key="option.value"
              :value="option.value"
              class="rounded-lg"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="timeRange">
          <SelectTrigger class="w-36 rounded-lg" aria-label="Select time range">
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent class="rounded-xl">
            <SelectItem value="90d" class="rounded-lg">Last 3 months</SelectItem>
            <SelectItem value="30d" class="rounded-lg">Last 30 days</SelectItem>
            <SelectItem value="7d" class="rounded-lg">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>

    <CardContent class="px-2 pt-4 sm:pt-6 pb-4 space-y-6">
      <!-- Stats Cards Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="p-4 rounded-xl border bg-card/50 hover:bg-accent/50 transition-colors cursor-pointer"
          :class="{
            'ring-2 ring-primary': selectedMetric === stat.label.toLowerCase().replace(' ', '')
          }"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="size-10 rounded-lg flex items-center justify-center" :class="stat.bgColor">
              <component :is="stat.icon" class="size-5" :class="stat.color" />
            </div>
            <div
              class="flex items-center gap-1 text-xs font-medium"
              :class="stat.trend > 0 ? 'text-green-500' : 'text-red-500'"
            >
              <TrendingUp v-if="stat.trend > 0" class="size-3" />
              <TrendingDown v-else class="size-3" />
              <span>{{ stat.trend > 0 ? "+" : "" }}{{ stat.trend }}%</span>
            </div>
          </div>
          <div class="text-2xl font-bold" :class="stat.color">{{ stat.value }}</div>
          <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Chart -->
      <ChartContainer :config="chartConfig" class="aspect-auto h-[250px] w-full" :cursor="false">
        <VisXYContainer :data="filterRange" :svg-defs="currentSvgDefs" :margin="{ left: -40 }">
          <VisArea
            :x="(d: Data) => d.date"
            :y="(d: Data) => d[selectedMetric as keyof Data] as number"
            :color="`url(#fillStats)`"
            :opacity="0.6"
          />
          <VisLine
            :x="(d: Data) => d.date"
            :y="(d: Data) => d[selectedMetric as keyof Data] as number"
            :color="currentMetricColor"
            :line-width="2"
          />
          <VisAxis
            type="x"
            :x="(d: Data) => d.date"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :num-ticks="6"
            :tick-format="(d: number) => {
              const date = new Date(d);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }"
          />
          <VisAxis type="y" :num-ticks="3" :tick-line="false" :domain-line="false" />
          <ChartTooltip />
          <ChartCrosshair
            :template="
              componentToString(chartConfig, ChartTooltipContent, {
                labelFormatter: (d) => {
                  return new Date(d).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });
                }
              })
            "
            :color="currentMetricColor"
          />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
