import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../ui/Button";
import  Input  from "../../ui/Input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "../../ui/Card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../ui/Tabs";
import  Label  from "../../ui/Label";
import { useToast } from "../../../hooks/useToast";
import { Spotlight } from "../../ui/Spotlight";

const API_BASE = "http://localhost:5001";  

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(
    location.state?.mode === "signup" ? false : true
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

      const payload = isLogin
        ? { email, password }
        : { firstName, email, password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
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
          title: "Authentication failed",
          description: data?.message || "Something went wrong",
        });
        return;
      }

      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: data.message,
      });

      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Network error",
        description: "Could not reach server",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden scanlines">
      
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="hsl(var(--accent))"
      />

      <motion.div
        className="w-full max-w-[480px] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mt-5 mb-7">
          <h1 className="text-5xl font-bold text-primary ">
            KNOLI
          </h1>
          <p className="text-muted-foreground text-lg">
            Master your knowledge, one card at a time
          </p>
        </div>

        <Card className="shadow-(--shadow-card) h-[500px] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome": "Create account"}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin
                ? "Sign in to continue your learning journey"
                : "Create an account to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={isLogin ? "login" : "signup"}
              onValueChange={(v) => setIsLogin(v === "login")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-5 h-10">
                <TabsTrigger value="login" className="text-base">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-base">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-secondary flex flex-col">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-base w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-secondary flex flex-col">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 text-base w-full"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="mt-21 w-full h-12 text-base font-semibold text-accent-foreground bg-primary "
                  >
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="signup-name" className="text-secondary flex flex-col">
                      First Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-10 text-base w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-secondary flex flex-col">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-base w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-secondary flex flex-col">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 text-base"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="mt-3 w-full h-12 text-base font-semibold  text-accent-foreground bg-primary"
                  >
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
