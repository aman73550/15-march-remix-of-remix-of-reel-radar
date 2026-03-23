import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AnalysisRecord {
  id: string;
  reel_url: string;
  viral_score: number | null;
  created_at: string;
  analysis_data: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  credits: number;
  maxCredits: number;
  canUseCredit: boolean;
  refreshUsage: () => Promise<void>;
  analyses: AnalysisRecord[];
  loadAnalyses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  credits: 0,
  maxCredits: 3,
  canUseCredit: false,
  refreshUsage: async () => {},
  analyses: [],
  loadAnalyses: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedCredits, setUsedCredits] = useState(0);
  const [maxCredits, setMaxCredits] = useState(3);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);

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

  // Load credit limit from site_config
  useEffect(() => {
    const loadLimit = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("config_value")
        .eq("config_key", "user_analysis_limit")
        .single();
      if (data) {
        setMaxCredits(parseInt((data as any).config_value) || 3);
      }
    };
    loadLimit();
  }, []);

  // Load used credits when user changes
  const refreshUsage = useCallback(async () => {
    if (!user) { setUsedCredits(0); return; }
    const { count } = await supabase
      .from("user_analyses" as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    setUsedCredits(count || 0);
  }, [user]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const loadAnalyses = useCallback(async () => {
    if (!user) { setAnalyses([]); return; }
    const { data } = await supabase
      .from("user_analyses" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) {
      setAnalyses(data as any[]);
    }
  }, [user]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

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
    setUsedCredits(0);
    setAnalyses([]);
  };

  const credits = Math.max(0, maxCredits - usedCredits);
  const canUseCredit = user ? credits > 0 : false;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signOut: signOutFn,
      credits,
      maxCredits,
      canUseCredit,
      refreshUsage,
      analyses,
      loadAnalyses,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
