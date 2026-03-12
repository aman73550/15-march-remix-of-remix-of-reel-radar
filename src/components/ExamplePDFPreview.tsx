import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Eye, Crown, ExternalLink } from "lucide-react";

const ExamplePDFPreview = () => {
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_config" as any)
        .select("config_value")
        .eq("config_key", "example_pdf_url")
        .single();
      if (data && (data as any).config_value) {
        setPdfUrl((data as any).config_value);
      }
    };
    fetch();
  }, []);

  if (!pdfUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="border border-border/50 bg-gradient-to-br from-muted/20 via-card to-primary/5 overflow-hidden">
        <div className="p-4 sm:p-5 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                Sample Master Report
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-medium">
                  PREVIEW
                </span>
              </h4>
              <p className="text-[11px] text-muted-foreground">See what you'll get in the premium report</p>
            </div>
          </div>

          {/* PDF Embed */}
          <div className="rounded-lg overflow-hidden border border-border/50 bg-background">
            <iframe
              src={pdfUrl}
              className="w-full h-[400px] sm:h-[500px]"
              title="Sample Master Report PDF"
              style={{ border: "none" }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 border-border/50 text-foreground text-xs"
              onClick={() => window.open(pdfUrl, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Open Full Preview
            </Button>
            <a href={pdfUrl} download className="flex-1">
              <Button variant="outline" className="w-full border-border/50 text-foreground text-xs">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download Sample
              </Button>
            </a>
          </div>

          <p className="text-center text-[10px] text-muted-foreground/50">
            This is a sample report • Your report will be customized for your reel
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default ExamplePDFPreview;
