import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInput = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      window.location.href = "/groups";
    } catch {
      setError("Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-[600px]">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account to access your flashcards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
              aria-describedby={error ? "login-error" : undefined}
              required
              data-testId="email-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
              aria-describedby={error ? "login-error" : undefined}
              required
              data-testId="password-input"
            />
          </div>
          {error && (
            <p id="login-error" className="text-sm text-destructive" role="alert" data-testId="login-error">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            data-testId="login-button"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
          <div className="flex justify-between w-full text-sm">
            <a href="/auth/register" className="text-muted-foreground hover:text-primary">
              Create account
            </a>
            <a href="/auth/reset-password" className="text-muted-foreground hover:text-primary">
              Forgot password?
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
