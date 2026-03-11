import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "hi";

const translations = {
  en: {
    badge: "AI-Powered Reel Analysis",
    title1: "Reel Viral",
    title2: " Analyzer",
    subtitle: "Paste your Instagram Reel link and get an AI-powered viral potential score with actionable insights",
    urlPlaceholder: "https://www.instagram.com/reel/...",
    captionPlaceholder: "Paste caption (optional)",
    hashtagPlaceholder: "Hashtags (optional, e.g. #viral #trending)",
    analyzing: "Analyzing...",
    analyzeBtn: "Analyze Viral Potential",
    enterUrl: "Enter a Reel URL",
    analysisFailed: "Analysis failed",
    tryAgain: "Please try again",
    hook: "Hook & Opening",
    caption: "Caption Quality",
    hashtag: "Hashtag Strategy",
    engagement: "Engagement Signals",
    trend: "Trend Alignment",
    recommendations: "Top Recommendations",
    scoreBreakdown: "Score Breakdown",
    categoryDistribution: "Category Distribution",
    viralPotential: "🔥 Viral Potential",
    goodPotential: "📈 Good Potential",
    moderate: "⚡ Moderate",
    needsWork: "💡 Needs Work",
    metricsLabel: "Engagement Metrics (optional)",
    likesPlaceholder: "Likes count",
    commentsPlaceholder: "Comments count",
    viewsPlaceholder: "Views count",
    sharesPlaceholder: "Shares count",
    savesPlaceholder: "Saves count",
    sampleCommentsPlaceholder: "Paste some comments (one per line, for sentiment analysis)",
    metricsVsAvg: "Your Metrics vs Category Average",
    yours: "Yours",
    categoryAvg: "Category Avg",
    commentSentiment: "Comment Sentiment Analysis",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    dominant: "Dominant",
    topThemes: "Top Themes",
    metric_likes: "Likes",
    metric_comments: "Comments",
    metric_shares: "Shares",
    metric_saves: "Saves",
    metric_views: "Views",
  },
  hi: {
    badge: "AI-संचालित रील विश्लेषण",
    title1: "रील वायरल",
    title2: " एनालाइज़र",
    subtitle: "अपनी Instagram रील लिंक पेस्ट करें और AI-संचालित वायरल संभावना स्कोर प्राप्त करें",
    urlPlaceholder: "https://www.instagram.com/reel/...",
    captionPlaceholder: "कैप्शन पेस्ट करें (वैकल्पिक)",
    hashtagPlaceholder: "हैशटैग (वैकल्पिक, जैसे #viral #trending)",
    analyzing: "विश्लेषण हो रहा है...",
    analyzeBtn: "वायरल संभावना विश्लेषण करें",
    enterUrl: "रील URL दर्ज करें",
    analysisFailed: "विश्लेषण विफल",
    tryAgain: "कृपया पुनः प्रयास करें",
    hook: "हुक और ओपनिंग",
    caption: "कैप्शन गुणवत्ता",
    hashtag: "हैशटैग रणनीति",
    engagement: "एंगेजमेंट सिग्नल",
    trend: "ट्रेंड संरेखण",
    recommendations: "शीर्ष सुझाव",
    scoreBreakdown: "स्कोर विवरण",
    categoryDistribution: "श्रेणी वितरण",
    viralPotential: "🔥 वायरल संभावना",
    goodPotential: "📈 अच्छी संभावना",
    moderate: "⚡ सामान्य",
    needsWork: "💡 सुधार ज़रूरी",
    metricsLabel: "एंगेजमेंट मेट्रिक्स (वैकल्पिक)",
    likesPlaceholder: "लाइक्स की संख्या",
    commentsPlaceholder: "कमेंट्स की संख्या",
    viewsPlaceholder: "व्यूज़ की संख्या",
    sharesPlaceholder: "शेयर की संख्या",
    savesPlaceholder: "सेव की संख्या",
    sampleCommentsPlaceholder: "कुछ कमेंट्स पेस्ट करें (एक प्रति लाइन, सेंटिमेंट विश्लेषण के लिए)",
    metricsVsAvg: "आपके मेट्रिक्स बनाम श्रेणी औसत",
    yours: "आपके",
    categoryAvg: "श्रेणी औसत",
    commentSentiment: "कमेंट सेंटिमेंट विश्लेषण",
    positive: "सकारात्मक",
    neutral: "तटस्थ",
    negative: "नकारात्मक",
    dominant: "प्रमुख",
    topThemes: "शीर्ष विषय",
    metric_likes: "लाइक्स",
    metric_comments: "कमेंट्स",
    metric_shares: "शेयर",
    metric_saves: "सेव",
    metric_views: "व्यूज़",
  },
};

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof translations)["en"];
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export const useLang = () => useContext(LangContext);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
};
