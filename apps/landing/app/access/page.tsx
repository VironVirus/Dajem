"use client";

import * as React from "react";
import { Button, Card, CardContent, useDajem } from "@repo/ui";

export default function AccessPage() {
  const { currentUser, isBootstrapping, openAuthModal } = useDajem();

  React.useEffect(() => {
    if (!currentUser) return;
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    let destination = "/dashboard";
    if (requestedPath?.startsWith("/")) {
      const requestedUrl = new URL(requestedPath, window.location.origin);
      if (requestedUrl.origin === window.location.origin && requestedUrl.pathname !== "/access") {
        destination = `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`;
      }
    }
    window.location.replace(destination);
  }, [currentUser]);

  return <main className="min-h-screen bg-background text-foreground">
    <div className="mx-auto grid min-h-[75vh] max-w-5xl place-items-center px-5 py-12">
      <Card className="w-full max-w-lg border-primary/20 shadow-xl">
        <CardContent className="space-y-5 p-7 sm:p-10">
          <img src="/images/dajem-logo.jpg" alt="DAJEM Group" className="h-16 w-16 rounded-2xl object-cover" />
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">DAJEM Group Limited</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome to your DAJEM account</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">Sign in to browse services, request a survey, shop, track an application, and download your invoices.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button disabled={isBootstrapping} onClick={() => openAuthModal("login")}>Log in</Button>
            <Button disabled={isBootstrapping} variant="outline" onClick={() => openAuthModal("signup")}>Create account</Button>
          </div>
          <p className="text-xs text-muted-foreground">New accounts require email confirmation before sign-in.</p>
        </CardContent>
      </Card>
    </div>
  </main>;
}
