import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    const fetchNumber = async () => {
      const { data } = await supabase
        .from("site_config" as any)
        .select("config_value")
        .eq("config_key", "whatsapp_number")
        .single();
      if (data && (data as any).config_value) {
        setWhatsappNumber((data as any).config_value);
      }
    };
    fetchNumber();
  }, []);

  if (!whatsappNumber) return null;

  const handleClick = () => {
    const msg = encodeURIComponent("Hi! I need help with Viral Reel Analyzer.");
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </button>
  );
};

export default WhatsAppButton;
