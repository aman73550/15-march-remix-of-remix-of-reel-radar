import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, X, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LoginPromptProps {
  open: boolean;
  onClose: () => void;
}

const LoginPrompt = ({ open, onClose }: LoginPromptProps) => {
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <Card className="p-6 border border-border bg-card shadow-2xl space-y-5">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl gradient-primary-bg flex items-center justify-center">
                  <LogIn className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-foreground">Login to Analyze</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sign in with Google to get <span className="font-semibold text-foreground">free reel analyses</span>. Quick, secure, and no password needed.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Get free AI-powered reel analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Your data stays private and secure</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                onClick={handleLogin}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-[10px] text-muted-foreground/60">
                By signing in, you agree to our Terms of Service
              </p>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPrompt;
