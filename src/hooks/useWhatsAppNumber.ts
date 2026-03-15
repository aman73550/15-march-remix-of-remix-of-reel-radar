import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWhatsAppNumber = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNumber = async () => {
      try {
        const { data } = await supabase
          .from("site_config" as any)
          .select("config_value")
          .eq("config_key", "whatsapp_number")
          .maybeSingle();
        if (data && (data as any).config_value) {
          setWhatsappNumber((data as any).config_value);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNumber();
  }, []);

  const openWhatsApp = (message?: string) => {
    if (!whatsappNumber) return;
    const msg = encodeURIComponent(message || "Hi! I need help with Reel Analyzer.");
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
  };

  return { whatsappNumber, loading, openWhatsApp };
};
