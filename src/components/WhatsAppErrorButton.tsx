import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  errorMessage?: string;
  className?: string;
}

const WHATSAPP_NUMBER = "918318557298";

const WhatsAppErrorButton = ({ errorMessage, className }: Props) => {
  const handleClick = () => {
    const msg = encodeURIComponent(
      `Hi! I faced an error while purchasing the Master Report on Viral Reel Analyzer.\n\nError: ${errorMessage || "Unknown error"}\n\nPlease help me resolve this.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] ${className || ""}`}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      WhatsApp Support
    </Button>
  );
};

export default WhatsAppErrorButton;
