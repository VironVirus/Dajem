"use client";

import * as React from "react";
import { Eye, EyeOff, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import type { CommunicationPreview } from "../lib/store";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { Select } from "./select";
import { localGovernmentsForState, nigeriaStates } from "../lib/nigeria-locations";

interface AuthModalProps {
  isOpen: boolean;
  mode: "login" | "signup";
  isBusy: boolean;
  error: string | null;
  preview: CommunicationPreview | null;
  onClose: () => void;
  onModeChange: (mode: "login" | "signup") => void;
  onAuthenticated: () => void;
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onRegister: (payload: {
    name: string;
    email: string;
    phone: string;
    country: string;
    address: string;
    state: string;
    localGovernment: string;
    password: string;
  }) => Promise<void>;
}

const phoneCountries = [
  { value: "NG", country: "Nigeria", dialCode: "+234", label: "Nigeria (+234)" },
  { value: "GH", country: "Ghana", dialCode: "+233", label: "Ghana (+233)" },
  { value: "KE", country: "Kenya", dialCode: "+254", label: "Kenya (+254)" },
  { value: "ZA", country: "South Africa", dialCode: "+27", label: "South Africa (+27)" },
  { value: "GB", country: "United Kingdom", dialCode: "+44", label: "United Kingdom (+44)" },
  { value: "US", country: "United States", dialCode: "+1", label: "United States (+1)" },
];

function formatInternationalPhone(dialCode: string, input: string) {
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith(dialCode.slice(1))) digits = digits.slice(dialCode.length - 1);
  if (dialCode === "+234") digits = digits.replace(/^0+/, "");

  return `${dialCode}${digits}`;
}

export function AuthModal({
  isOpen,
  mode,
  isBusy,
  error,
  preview,
  onClose,
  onModeChange,
  onAuthenticated,
  onLogin,
  onRegister,
}: AuthModalProps) {
  const [loginForm, setLoginForm] = React.useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = React.useState({
    name: "",
    email: "",
    countryCode: "NG",
    phone: "",
    address: "",
    state: "",
    localGovernment: "",
    password: "",
    confirmPassword: "",
  });
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [showSignupPassword, setShowSignupPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const selectedLocalGovernments = localGovernmentsForState(signupForm.state);

  React.useEffect(() => {
    if (!isOpen) {
      setLoginForm({ email: "", password: "" });
      setSignupForm({
        name: "",
        email: "",
        countryCode: "NG",
        phone: "",
        address: "",
        state: "",
        localGovernment: "",
        password: "",
        confirmPassword: "",
      });
      setShowLoginPassword(false);
      setShowSignupPassword(false);
      setShowConfirmPassword(false);
      setFormError(null);
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

          <Button className="w-full bg-primary text-white" onClick={() => { onClose(); onAuthenticated(); }}>
            Open my dashboard
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
          </div>

          {(error || formError) && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError ?? error}
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
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    className="pr-20"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center gap-1 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => setShowLoginPassword((visible) => !visible)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showLoginPassword ? "Hide" : "Show"}
                  </button>
                </div>
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
                setFormError(null);
                if (signupForm.password !== signupForm.confirmPassword) {
                  setFormError("Passwords do not match.");
                  return;
                }

                const selectedCountry = phoneCountries.find((country) => country.value === signupForm.countryCode) ?? phoneCountries[0];
                await onRegister({
                  name: signupForm.name,
                  email: signupForm.email,
                  phone: formatInternationalPhone(selectedCountry.dialCode, signupForm.phone),
                  country: selectedCountry.country,
                  address: signupForm.address,
                  state: signupForm.state,
                  localGovernment: signupForm.localGovernment,
                  password: signupForm.password,
                });
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
              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={signupForm.email}
                  onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Select
                  label="Country"
                  value={signupForm.countryCode}
                  onChange={(event) => setSignupForm((current) => ({ ...current, countryCode: event.target.value }))}
                  options={phoneCountries.map(({ value, label }) => ({ value, label }))}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="signup-phone">Phone number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    required
                    inputMode="tel"
                    placeholder="080 1234 5678"
                    value={signupForm.phone}
                    onChange={(event) => setSignupForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-address">Address</Label>
                <Input
                  id="signup-address"
                  required
                  autoComplete="street-address"
                  value={signupForm.address}
                  onChange={(event) => setSignupForm((current) => ({ ...current, address: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="State"
                  required
                  value={signupForm.state}
                  onChange={(event) => setSignupForm((current) => ({ ...current, state: event.target.value, localGovernment: "" }))}
                  options={[
                    { value: "", label: "Select your state" },
                    ...nigeriaStates.map((state) => ({ value: state, label: state })),
                  ]}
                />
                <Select
                  label="Local government"
                  required
                  disabled={!signupForm.state}
                  value={signupForm.localGovernment}
                  onChange={(event) => setSignupForm((current) => ({ ...current, localGovernment: event.target.value }))}
                  options={[
                    { value: "", label: signupForm.state ? "Select your local government" : "Choose a state first" },
                    ...selectedLocalGovernments.map((localGovernment) => ({ value: localGovernment, label: localGovernment })),
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="pr-20"
                    value={signupForm.password}
                    onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center gap-1 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => setShowSignupPassword((visible) => !visible)}
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showSignupPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-confirm-password">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="pr-20"
                    value={signupForm.confirmPassword}
                    onChange={(event) => setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center gap-1 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
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
