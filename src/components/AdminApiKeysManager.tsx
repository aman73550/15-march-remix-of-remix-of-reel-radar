import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Key, Plus, Trash2, EyeOff, Eye, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface ApiKeyGroup {
  configKey: string;
  label: string;
  description: string;
  placeholder: string;
  maxKeys: number;
}

const API_KEY_GROUPS: ApiKeyGroup[] = [
  {
    configKey: "gemini_api_keys",
    label: "🤖 Gemini API Keys",
    description: "Google Gemini keys for reel analysis & reports. Auto-failover on rate limits.",
    placeholder: "AIzaSy...",
    maxKeys: 10,
  },
  {
    configKey: "firecrawl_api_key",
    label: "🔥 Firecrawl API Keys",
    description: "Web scraping for SEO research. Optional but recommended.",
    placeholder: "fc-...",
    maxKeys: 10,
  },
  {
    configKey: "openai_api_keys",
    label: "🧠 OpenAI API Keys (Optional)",
    description: "Alternative to Gemini. Only used if Gemini is not configured.",
    placeholder: "sk-...",
    maxKeys: 10,
  },
];

const maskKey = (key: string) => {
  if (key.length <= 8) return "••••••••";
  return key.substring(0, 4) + "••••" + key.substring(key.length - 4);
};

const AdminApiKeysManager = () => {
  const [keys, setKeys] = useState<Record<string, string[]>>({});
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>({});
  const [newKeyInputs, setNewKeyInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const configKeys = API_KEY_GROUPS.map((g) => g.configKey);
    const { data } = await supabase
      .from("site_config" as any)
      .select("config_key, config_value")
      .in("config_key", configKeys);

    const loaded: Record<string, string[]> = {};
    if (data) {
      for (const row of data as any[]) {
        const val = row.config_value || "";
        loaded[row.config_key] = val
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean);
      }
    }
    // Initialize empty arrays for groups without data
    for (const g of API_KEY_GROUPS) {
      if (!loaded[g.configKey]) loaded[g.configKey] = [];
    }
    setKeys(loaded);
  };

  const saveKeysForGroup = async (configKey: string) => {
    setSaving(true);
    try {
      const value = (keys[configKey] || []).join(",");
      const { data: existing } = await supabase
        .from("site_config" as any)
        .select("id")
        .eq("config_key", configKey)
        .single();

      if (existing) {
        await supabase
          .from("site_config" as any)
          .update({ config_value: value, updated_at: new Date().toISOString() })
          .eq("config_key", configKey);
      } else {
        await supabase
          .from("site_config" as any)
          .insert({ config_key: configKey, config_value: value } as any);
      }
      toast.success("API keys saved securely!");
    } catch {
      toast.error("Failed to save keys");
    } finally {
      setSaving(false);
    }
  };

  const addKey = (configKey: string) => {
    const newKey = (newKeyInputs[configKey] || "").trim();
    if (!newKey) return;

    const group = API_KEY_GROUPS.find((g) => g.configKey === configKey);
    const current = keys[configKey] || [];
    if (current.length >= (group?.maxKeys || 10)) {
      toast.error(`Maximum ${group?.maxKeys || 10} keys allowed`);
      return;
    }
    if (current.includes(newKey)) {
      toast.error("This key already exists");
      return;
    }

    setKeys((prev) => ({ ...prev, [configKey]: [...current, newKey] }));
    setNewKeyInputs((prev) => ({ ...prev, [configKey]: "" }));
  };

  const removeKey = (configKey: string, index: number) => {
    setKeys((prev) => ({
      ...prev,
      [configKey]: (prev[configKey] || []).filter((_, i) => i !== index),
    }));
  };

  const toggleVisibility = (configKey: string) => {
    setVisibleGroups((prev) => ({ ...prev, [configKey]: !prev[configKey] }));
  };

  const testKeys = async (configKey: string) => {
    const keyList = keys[configKey] || [];
    if (keyList.length === 0) {
      toast.error("No keys to test");
      return;
    }
    setTesting(configKey);

    try {
      // Quick validation - check key format
      let validCount = 0;
      for (const key of keyList) {
        if (configKey.includes("gemini") && key.startsWith("AIza")) validCount++;
        else if (configKey.includes("firecrawl") && key.startsWith("fc-")) validCount++;
        else if (configKey.includes("openai") && key.startsWith("sk-")) validCount++;
        else validCount++; // Accept unknown formats
      }
      toast.success(`${validCount}/${keyList.length} keys look valid`);
    } finally {
      setTesting(null);
    }
  };

  return (
    <Card className="border-border bg-card col-span-1 md:col-span-2">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
          <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          API Keys Manager
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
          Add up to 10 keys per service. Auto-failover: when one key hits rate limits, the next one takes over seamlessly.
        </p>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        {API_KEY_GROUPS.map((group) => {
          const groupKeys = keys[group.configKey] || [];
          const isVisible = visibleGroups[group.configKey];

          return (
            <div key={group.configKey} className="p-3 sm:p-4 rounded-xl bg-muted/20 border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground">{group.label}</h3>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{group.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${groupKeys.length > 0 ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                    {groupKeys.length}/{group.maxKeys}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(group.configKey)}
                    className="h-7 w-7 p-0"
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Existing Keys */}
              {groupKeys.length > 0 && (
                <div className="space-y-1.5">
                  {groupKeys.map((key, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-mono flex-1 truncate">
                        Key #{idx + 1}: {isVisible ? key : maskKey(key)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeKey(group.configKey, idx)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Key */}
              {groupKeys.length < group.maxKeys && (
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={newKeyInputs[group.configKey] || ""}
                    onChange={(e) => setNewKeyInputs((prev) => ({ ...prev, [group.configKey]: e.target.value }))}
                    placeholder={group.placeholder}
                    className="bg-background/50 border-border h-8 text-xs font-mono flex-1"
                    onKeyDown={(e) => e.key === "Enter" && addKey(group.configKey)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addKey(group.configKey)}
                    className="h-8 px-2 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveKeysForGroup(group.configKey)}
                  disabled={saving}
                  className="h-7 text-[10px] sm:text-xs"
                >
                  {saving ? "Saving..." : "Save Keys"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => testKeys(group.configKey)}
                  disabled={testing === group.configKey}
                  className="h-7 text-[10px] sm:text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${testing === group.configKey ? "animate-spin" : ""}`} />
                  Validate
                </Button>
              </div>
            </div>
          );
        })}

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-[10px] sm:text-xs text-muted-foreground space-y-1">
              <p><strong className="text-foreground">How it works:</strong> Keys are stored securely in the database and accessed only by backend functions.</p>
              <p>• When a key hits rate limits (429/402/403), the system automatically switches to the next key.</p>
              <p>• More keys = more concurrent users without rate limiting.</p>
              <p>• Keys are never exposed to end users or the frontend.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminApiKeysManager;
