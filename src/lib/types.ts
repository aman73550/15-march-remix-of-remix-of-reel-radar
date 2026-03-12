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

export interface VideoQuality {
  resolution: string;
  lighting: string;
  cameraStability: string;
  visualClarity: string;
  qualityScore: number;
}

export interface AudioQuality {
  voiceClarity: string;
  backgroundAudio: string;
  soundBalance: string;
  musicUsage: string;
  qualityScore: number;
}

export interface ContentClassification {
  primaryCategory: string;
  subCategory: string;
  contentType: string;
  detectedElements: {
    objects: string[];
    people: string;
    actions: string[];
    scene: string;
    onScreenText: string[];
    estimatedTopic: string;
  };
  confidence: string;
  reasoning: string;
  hashtagAlignment: string;
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

export type ViralStatus = "Already Viral" | "Growing" | "Low Viral Potential";

export interface ViralClassification {
  status: ViralStatus;
  score: number; // 0-100
  label: string; // "Viral Strength" or "Viral Potential"
  reasons: string[];
  engagementRate?: number;
}

export interface PatternComparison {
  patternsCompared: number;
  viralPatternsCount?: number;
  similarityScore: number | null;
  categoryAvgScore: number | null;
  categoryAvgHookScore?: number;
  categoryAvgCaptionScore?: number;
  insights: string[];
  topPatternFeatures: {
    hookType: string | null;
    facePresence: string | null;
    motionIntensity: string | null;
  } | null;
}

export interface ReelAnalysis {
  viralScore: number;
  overallSummary: string;
  viralClassification?: ViralClassification;
  contentClassification?: ContentClassification;
  thumbnailAnalyzed?: boolean;
  patternComparison?: PatternComparison;

  hookAnalysis: HookAnalysis;
  captionAnalysis: CaptionAnalysis;
  hashtagAnalysis: HashtagAnalysis;
  videoSignals: VideoSignals;
  videoQuality?: VideoQuality;
  audioQuality?: AudioQuality;
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
