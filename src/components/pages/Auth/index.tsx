import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../ui/Button";
import  Input  from "../../ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/Card";
import  Label from "../../ui/Label";
import { Lightbulb, Sparkles } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import PixelSpaceship from "../../pixel/PixelSpaceship";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin
        ? { email, password }
        : { firstName, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Auth error",
          description: data?.message || "Something went wrong",
        });
        setLoading(false);
        return;
      }

      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: data?.message || (isLogin ? "Logged in" : "Signed up"),
      });

      clearForm();
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth submit error:", err);
      toast({
        title: "Network error",
        description: "Couldn't reach the server. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute -top-24 left-0 opacity-20">
        <PixelSpaceship className="w-32 h-32 text-foreground" />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10 p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 relative"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Lightbulb className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-white absolute -top-1 -right-1" />
          </div>
          <h1 className="text-4xl font-pixel mb-1">KNOLI</h1>
          <p className="text-muted-foreground text-sm">Master your knowledge, one card at a time</p>
        </div>

        <Card className="glass-card border-4">
          <CardHeader>
            <CardTitle className="text-xl">{isLogin ? "Sign in" : "Create account"}</CardTitle>
            <CardDescription className="text-sm">
              {isLogin ? "Sign in to continue" : "Create an account to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                className={`py-2 px-3 font-pixel text-sm uppercase border-4 ${isLogin ? "bg-card" : "bg-transparent"} border-foreground`}
                onClick={() => setIsLogin(true)}
                type="button"
              >
                Login
              </button>
              <button
                className={`py-2 px-3 font-pixel text-sm uppercase border-4 ${!isLogin ? "bg-card" : "bg-transparent"} border-foreground`}
                onClick={() => setIsLogin(false)}
                type="button"
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button type="submit" className="w-full h-12 font-pixel" disabled={loading}>
                  {loading ? (isLogin ? "Signing in..." : "Creating...") : (isLogin ? "Sign in" : "Create account")}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setEmail(""); setPassword(""); setFirstName(""); }} className="w-full h-12 font-pixel">
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
