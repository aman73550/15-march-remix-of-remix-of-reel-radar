export interface HookAnalysis {
  score: number;
  firstThreeSeconds: string;
  openingType: string;
  attentionGrabber: string;
  details: string[];
}

export interface CaptionAnalysis {
  score: number;
  curiosityLevel: number;
  emotionalTriggers: string[];
  callToAction: string;
  keywordDensity: string;
  lengthEffectiveness: string;
  details: string[];
}

export interface HashtagAnalysis {
  score: number;
  hashtags: {
    tag: string;
    competition: string;
    relevance: string;
    trendStrength: string;
  }[];
  details: string[];
}

export interface CommentSentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  questionRatio: number;
  engagementSignals: string[];
  audienceIntent: string;
  topThemes: string[];
  summary: string;
}

export interface VideoSignals {
  estimatedSceneCuts: string;
  textOverlayLikely: string;
  facePresenceLikely: string;
  motionIntensity: string;
  visualEngagement: string;
  details: string[];
}

export interface TrendMatching {
  score: number;
  formatSimilarity: string;
  hookPattern: string;
  trendingStructure: string;
  matchedTrends: string[];
  details: string[];
}

export interface MetricComparison {
  value: number;
  avgInCategory: number;
  verdict: string;
}

export interface ReelAnalysis {
  viralScore: number;
  overallSummary: string;

  hookAnalysis: HookAnalysis;
  captionAnalysis: CaptionAnalysis;
  hashtagAnalysis: HashtagAnalysis;
  videoSignals: VideoSignals;
  trendMatching: TrendMatching;

  engagementScore: number;
  engagementDetails: string[];
  engagementRate?: string;

  metricsComparison?: {
    likes?: MetricComparison;
    comments?: MetricComparison;
    shares?: MetricComparison;
    saves?: MetricComparison;
    views?: MetricComparison;
  };

  commentSentiment?: CommentSentimentAnalysis;

  topRecommendations: string[];

  // Legacy compat
  hookScore?: number;
  hookDetails?: string[];
  captionScore?: number;
  captionDetails?: string[];
  hashtagScore?: number;
  hashtagDetails?: string[];
  trendScore?: number;
  trendDetails?: string[];
}

export interface ReelMetadata {
  url: string;
  title?: string;
  authorName?: string;
  thumbnailUrl?: string;
}
