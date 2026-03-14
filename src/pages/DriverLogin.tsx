import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Truck, LogIn } from "lucide-react";
import { motion } from "framer-motion";

const DriverLogin = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      // Check if user is a driver
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: driver } = await (supabase as any).from("drivers").select("id").eq("user_id", user.id).maybeSingle();
        if (driver) {
          nav("/driver");
        } else {
          await supabase.auth.signOut();
          toast({ title: "Access denied", description: "This account is not linked to a driver profile.", variant: "destructive" });
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Driver Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to view your assigned trips</p>
        </div>

        <div className="border border-border rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="driver@example.com" required />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Signing in..." : <><LogIn className="w-4 h-4 mr-2" /> Sign In</>}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DriverLogin;
