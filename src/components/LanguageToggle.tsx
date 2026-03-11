import { useLang } from "@/lib/LangContext";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { lang, setLang } = useLang();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full glass text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
    >
      <Globe className="w-4 h-4 text-primary" />
      <span>{lang === "en" ? "हिंदी" : "English"}</span>
    </motion.button>
  );
};

export default LanguageToggle;
