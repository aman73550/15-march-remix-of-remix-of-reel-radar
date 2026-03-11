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
}

export interface ReelMetadata {
  url: string;
  title?: string;
  authorName?: string;
  thumbnailUrl?: string;
}
