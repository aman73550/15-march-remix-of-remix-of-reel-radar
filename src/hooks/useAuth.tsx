import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  analysisCount: number;
  analysisLimit: number;
  canAnalyze: boolean;
  refreshUsage: () => Promise<void>;
  lastAnalysis: any | null;
  loadLastAnalysis: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  analysisCount: 0,
  analysisLimit: 2,
  canAnalyze: false,
  refreshUsage: async () => {},
  lastAnalysis: null,
  loadLastAnalysis: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [analysisLimit, setAnalysisLimit] = useState(2);
  const [lastAnalysis, setLastAnalysis] = useState<any | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load analysis limit from site_config
  useEffect(() => {
    const loadLimit = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("config_value")
        .eq("config_key", "user_analysis_limit")
        .single();
      if (data) {
        setAnalysisLimit(parseInt((data as any).config_value) || 2);
      }
    };
    loadLimit();
  }, []);

  // Load analysis count when user changes
  const refreshUsage = useCallback(async () => {
    if (!user) { setAnalysisCount(0); return; }
    const { count } = await supabase
      .from("user_analyses" as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    setAnalysisCount(count || 0);
  }, [user]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const loadLastAnalysis = useCallback(async () => {
    if (!user) { setLastAnalysis(null); return; }
    const { data } = await supabase
      .from("user_analyses" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data && (data as any[]).length > 0) {
      setLastAnalysis((data as any[])[0]);
    }
  }, [user]);

  useEffect(() => {
    loadLastAnalysis();
  }, [loadLastAnalysis]);

  const signInWithGoogle = async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
  };

  const signOutFn = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAnalysisCount(0);
    setLastAnalysis(null);
  };

  const canAnalyze = user ? analysisCount < analysisLimit : false;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signOut: signOutFn,
      analysisCount,
      analysisLimit,
      canAnalyze,
      refreshUsage,
      lastAnalysis,
      loadLastAnalysis,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
