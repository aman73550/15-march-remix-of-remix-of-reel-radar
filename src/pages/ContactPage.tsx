import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    if (message.trim().length > 2000) {
      toast({ title: "Message too long (max 2000 chars)", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        reel_url: `contact:${email}`,
        rating: 0,
        comment: `[Contact Form] Name: ${name.trim()}\nEmail: ${email.trim()}\nMessage: ${message.trim()}`,
      });
      if (error) throw error;
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast({ title: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Contact Us – Reel Analyzer" description="Get in touch with the Reel Analyzer team for support, feedback, or business inquiries." canonical="https://reelanalyzer.app/contact" />

      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-sm text-muted-foreground mb-8">Have a question, feedback, or business inquiry? We'd love to hear from you.</p>

        {sent ? (
          <div className="text-center py-12 space-y-3">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Message Sent!</h2>
            <p className="text-sm text-muted-foreground">Thank you for reaching out. We'll get back to you soon.</p>
            <Button variant="outline" size="sm" onClick={() => setSent(false)}>Send Another Message</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Name</label>
              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Email</label>
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Message</label>
              <Textarea placeholder="Your message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={2000} />
            </div>
            <Button type="submit" disabled={sending} className="w-full gap-2">
              {sending ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
            </Button>
          </form>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default ContactPage;
