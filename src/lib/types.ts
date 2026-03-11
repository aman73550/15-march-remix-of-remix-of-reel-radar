export interface ReelAnalysis {
  viralScore: number;
  hookScore: number;
  hookDetails: string[];
  captionScore: number;
  captionDetails: string[];
  hashtagScore: number;
  hashtagDetails: string[];
  engagementScore: number;
  engagementDetails: string[];
  trendScore: number;
  trendDetails: string[];
  overallSummary: string;
  topRecommendations: string[];
  // Engagement metrics comparison
  metricsComparison?: {
    likes?: { value: number; avgInCategory: number; verdict: string };
    comments?: { value: number; avgInCategory: number; verdict: string };
    shares?: { value: number; avgInCategory: number; verdict: string };
    saves?: { value: number; avgInCategory: number; verdict: string };
    views?: { value: number; avgInCategory: number; verdict: string };
  };
  // Comment sentiment
  commentSentiment?: {
    positive: number;
    neutral: number;
    negative: number;
    topThemes: string[];
    summary: string;
  };
}

export interface ReelMetadata {
  url: string;
  title?: string;
  authorName?: string;
  thumbnailUrl?: string;
}
