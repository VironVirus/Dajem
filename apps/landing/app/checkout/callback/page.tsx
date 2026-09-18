"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, Button, Card, CardContent, Footer, Header, getAppBaseUrl, useDajem } from "@repo/ui";
import { CheckCircle2, LoaderCircle } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const { navigateToUrl, verifyFlutterwaveCheckout } = useDajem();
  const [status, setStatus] = React.useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = React.useState("Verifying your payment with Flutterwave...");
  const [orderTotal, setOrderTotal] = React.useState<number | null>(null);

  React.useEffect(() => {
    let redirectTimer: number | undefined;
    const txRef = searchParams.get("tx_ref");
    const transactionId = searchParams.get("transaction_id") ?? undefined;

    if (!txRef) {
      setStatus("error");
      setMessage("Missing transaction reference in the callback URL.");
      return;
    }

    void verifyFlutterwaveCheckout({ txRef, transactionId })
      .then((result) => {
        setOrderTotal(result.order?.total ?? null);
        setStatus("success");
        setMessage("Payment verified. Opening your order dashboard...");
        redirectTimer = window.setTimeout(() => {
          void navigateToUrl("/dashboard#billing");
        }, 1500);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Unable to verify the payment.");
      });
    return () => {
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [navigateToUrl, searchParams, verifyFlutterwaveCheckout]);

  return (
    <Card className="w-full">
      <CardContent className="space-y-5 p-8 text-center">
        <Badge variant="secondary" className="mx-auto w-max">Payment Status</Badge>
        {status === "verifying" ? (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${status === "success" ? "bg-emerald-100 dark:bg-emerald-950/50" : "bg-destructive/10"}`}>
            <CheckCircle2 className={`h-7 w-7 ${status === "success" ? "text-emerald-500" : "text-destructive"}`} />
          </div>
        )}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary dark:text-foreground">
            {status === "success" ? "Payment confirmed" : status === "error" ? "Verification issue" : "Verifying payment"}
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          {orderTotal !== null && (
            <p className="text-sm font-semibold text-foreground">Order total: {formatCurrency(orderTotal)}</p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => void navigateToUrl(getAppBaseUrl("poultry"))}>
            Back to DAJEM Farms
          </Button>
          <Button className="bg-primary text-white" onClick={() => void navigateToUrl("/dashboard")}>
            Open Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CallbackFallback() {
  return (
    <Card className="w-full">
      <CardContent className="space-y-5 p-8 text-center">
        <Badge variant="secondary" className="mx-auto w-max">Payment Status</Badge>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading payment callback...</p>
      </CardContent>
    </Card>
  );
}

export default function PoultryCheckoutCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="poultry" />
      <main className="container mx-auto flex max-w-3xl flex-1 items-center px-4 py-16">
        <Suspense fallback={<CallbackFallback />}>
          <CallbackContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
