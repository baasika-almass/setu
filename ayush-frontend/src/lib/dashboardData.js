export const STATS = [
  { label: "Total Examinations", value: "14,832", delta: "+12.4% vs last week", tone: "positive" },
  { label: "Successful API Translations", value: "99.82%", delta: "14,805 processed", tone: "positive" },
  { label: "Failed Sync Requests", value: "27", delta: "0.18% fail rate", tone: "negative" },
  { label: "Average Response Time", value: "180ms", delta: "WHO Registry target met", tone: "positive" },
];

export const WEEKLY_DATA = [
  { day: "Mon", mapped: 62, pending: 18, failed: 3 },
  { day: "Tue", mapped: 74, pending: 22, failed: 2 },
  { day: "Wed", mapped: 58, pending: 15, failed: 4 },
  { day: "Thu", mapped: 81, pending: 25, failed: 1 },
  { day: "Fri", mapped: 69, pending: 20, failed: 3 },
  { day: "Sat", mapped: 47, pending: 12, failed: 2 },
  { day: "Sun", mapped: 39, pending: 9, failed: 1 },
];

export const CODIFICATION_DATA = [
  { name: "Ayurveda", value: 65, color: "#4a45d1" },
  { name: "Yoga & Naturopathy", value: 20, color: "#2fd3ac" },
  { name: "Unani / Siddha", value: 15, color: "#ff8a7a" },
];

// Turns backend /v1/stats into the four dashboard cards (falls back to the demo numbers).
export function buildStats(stats) {
  if (!stats) return STATS;
  const rate = stats.successRate;
  return [
    { label: "Total Examinations", value: stats.totalExaminations.toLocaleString(), delta: "Encounters saved to the EMR", tone: "positive" },
    { label: "Successful API Translations", value: rate == null ? "—" : `${rate}%`, delta: `${stats.apiCalls.toLocaleString()} API calls logged`, tone: "positive" },
    { label: "Failed Sync Requests", value: stats.failedRequests.toLocaleString(), delta: "Calls with an error status", tone: "negative" },
    { label: "Average Response Time", value: stats.avgLatencyMs == null ? "—" : `${stats.avgLatencyMs}ms`, delta: "Across all logged calls", tone: "positive" },
  ];
}
