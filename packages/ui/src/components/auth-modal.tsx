"use client";

import * as React from "react";
import { Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import type { CommunicationPreview } from "../lib/store";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";

interface AuthModalProps {
  isOpen: boolean;
  mode: "login" | "signup";
  isBusy: boolean;
  error: string | null;
  preview: CommunicationPreview | null;
  onClose: () => void;
  onModeChange: (mode: "login" | "signup") => void;
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onRegister: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
}

export function AuthModal({
  isOpen,
  mode,
  isBusy,
  error,
  preview,
  onClose,
  onModeChange,
  onLogin,
  onRegister,
}: AuthModalProps) {
  const [loginForm, setLoginForm] = React.useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  React.useEffect(() => {
    if (!isOpen) {
      setLoginForm({ email: "", password: "" });
      setSignupForm({ name: "", email: "", phone: "", password: "" });
    }
  }, [isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={preview ? "Registration Communication Preview" : "Welcome to Dajem Group Limited"}
    >
      {preview ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-semibold">Account created and signed in</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This is the styled SMS and email simulator that appears after registration.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center gap-2 text-cyan-600 dark:text-cyan-300">
                <MessageSquareText className="h-4 w-4" />
                <span className="text-sm font-semibold">SMS Dispatch</span>
              </div>
              <p className="text-xs text-muted-foreground">To: {preview.sms.to}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {preview.sms.message}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-semibold">Email Dispatch</span>
              </div>
              <p className="text-xs text-muted-foreground">To: {preview.email.to}</p>
              <p className="text-xs text-muted-foreground">Subject: {preview.email.subject}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {preview.email.message}
              </p>
            </div>
          </div>

          <Button className="w-full bg-primary text-white" onClick={onClose}>
            Continue into the portal
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10 p-4">
            <div className="mb-3 flex gap-2">
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${mode === "login" ? "bg-primary text-white" : "bg-background text-muted-foreground border"}`}
                onClick={() => onModeChange("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${mode === "signup" ? "bg-primary text-white" : "bg-background text-muted-foreground border"}`}
                onClick={() => onModeChange("signup")}
                type="button"
              >
                Sign Up
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              One account unlocks the shared cart, bids, surveys, dashboard, and admin tools.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                await onLogin(loginForm);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email address</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-white" disabled={isBusy}>
                {isBusy ? "Signing in..." : "Login to Dajem"}
              </Button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                await onRegister(signupForm);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">Full name</Label>
                <Input
                  id="signup-name"
                  required
                  value={signupForm.name}
                  onChange={(event) => setSignupForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-phone">Phone</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    required
                    value={signupForm.phone}
                    onChange={(event) => setSignupForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  required
                  value={signupForm.password}
                  onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={isBusy}>
                {isBusy ? "Creating account..." : "Create shared Dajem account"}
              </Button>
            </form>
          )}
        </div>
      )}
    </Dialog>
  );
}
