import { MessageCircle } from "lucide-react";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

const WhatsAppButton = () => {
  const { whatsappNumber, openWhatsApp } = useWhatsAppNumber();

  if (!whatsappNumber) return null;

  return (
    <button
      onClick={() => openWhatsApp()}
      className="fixed bottom-20 md:bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </button>
  );
};

export default WhatsAppButton;
