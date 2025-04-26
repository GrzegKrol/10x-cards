import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ResetPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
}

export default function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(email);
      setIsSuccessful(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset instructions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateInput = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    return true;
  };

  if (isSuccessful) {
    return (
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>We&apos;ve sent password reset instructions to {email}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="link" className="w-full" onClick={() => (window.location.href = "/auth/login")}>
            Return to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-[600px]">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you instructions to reset your password
          </CardDescription>
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
              aria-describedby={error ? "reset-error" : undefined}
              required
            />
          </div>
          {error && (
            <p id="reset-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? "Sending Instructions..." : "Send Instructions"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => (window.location.href = "/auth/login")}
          >
            Back to Sign In
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
