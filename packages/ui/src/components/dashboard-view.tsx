"use client";

import * as React from "react";
import { ArrowRight, BellRing, ClipboardList, Download, Layers3, Package, ShoppingCart } from "lucide-react";
import { getAppBaseUrl } from "../lib/store";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useDajem } from "./dajem-provider";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildSurveyDownloadHref(title: string) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(title)}`;
}

export function DashboardView() {
  const { snapshot, currentUser, isBootstrapping, openAuthModal } = useDajem();

  if (isBootstrapping) {
    return <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading your shared Dajem dashboard...</div>;
  }

  if (!currentUser) {
    return (
      <Card className="border-dashed shadow-none">
        <CardHeader>
          <Badge variant="secondary" className="w-max">Shared User Portal</Badge>
          <CardTitle>Sign in to unlock the unified dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your shared dashboard aggregates Dajem Farms cart activity, Dajem Homes bids/listings, Dajem Orbital requests, and communication logs.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary text-white" onClick={() => openAuthModal("login")}>
              Login
            </Button>
            <Button variant="outline" onClick={() => openAuthModal("signup")}>
              Create account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { label: "Cart Items", value: snapshot.cart.reduce((total, item) => total + item.quantity, 0), icon: ShoppingCart },
    { label: "Orders", value: snapshot.orders.length, icon: Package },
    {
      label: "Property Activity",
      value: snapshot.bids.length + snapshot.propertyListings.filter((listing) => listing.submittedByEmail === currentUser.email).length,
      icon: Layers3,
    },
    { label: "Survey Requests", value: snapshot.surveys.length, icon: ClipboardList },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-3xl border bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10 p-6">
        <Badge variant="secondary" className="w-max">Shared User Portal</Badge>
        <h1 className="text-3xl font-bold text-primary dark:text-foreground">Welcome back, {currentUser.name}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Orders, bids, property submissions, surveys, and your active Dajem Farms cart now live in one place across Dajem Group Limited.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1">Backend: {snapshot.integrations.backend}</span>
          <span className="rounded-full border px-3 py-1">Supabase: {snapshot.integrations.supabaseConfigured ? "Configured" : "Not configured yet"}</span>
          <span className="rounded-full border px-3 py-1">Flutterwave: {snapshot.integrations.flutterwaveConfigured ? "Configured" : "Simulation mode"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metric.value}</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <metric.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Active Dajem Farms Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your shared cart is empty right now.</p>
            ) : (
              snapshot.cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} units • {formatCurrency(item.price)}</p>
                  </div>
                  <Badge variant="outline">{formatCurrency(item.price * item.quantity)}</Badge>
                </div>
              ))
            )}
            <a href={`${getAppBaseUrl("poultry")}/#catalog`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Continue shopping
              <ArrowRight className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.communicationLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Communication previews will appear here after registration and workflow updates.</p>
            ) : (
              snapshot.communicationLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="rounded-xl border p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <BellRing className="h-3.5 w-3.5 text-emerald-500" />
                    {log.channel}
                  </div>
                  <p className="font-semibold text-foreground">{log.subject}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{log.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed orders yet.</p>
            ) : (
              snapshot.orders.map((order) => (
                <div key={order.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{order.reference}</p>
                      <p className="text-xs text-muted-foreground">{order.date} • {order.provider}</p>
                    </div>
                    <Badge>{formatCurrency(order.total)}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dajem Homes Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.bids.length === 0 && snapshot.propertyListings.filter((listing) => listing.submittedByEmail === currentUser.email).length === 0 ? (
              <p className="text-sm text-muted-foreground">No bids or listing submissions yet.</p>
            ) : (
              <>
                {snapshot.propertyListings.filter((listing) => listing.submittedByEmail === currentUser.email).map((listing) => (
                  <div key={listing.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{listing.title}</p>
                        <p className="text-xs text-muted-foreground">{listing.location}</p>
                      </div>
                      <Badge variant={listing.status === "Approved" ? "default" : listing.status === "Rejected" ? "destructive" : "secondary"}>
                        {listing.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Listing proposal: {formatCurrency(listing.price)}</p>
                  </div>
                ))}
                {snapshot.bids.map((bid) => (
                  <div key={bid.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{bid.propertyTitle}</p>
                        <p className="text-xs text-muted-foreground">{bid.propertyLocation}</p>
                      </div>
                      <Badge variant={bid.status === "Connected" ? "default" : bid.status === "Rejected" ? "destructive" : "secondary"}>
                        {bid.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Your bid: {formatCurrency(bid.bidAmount)}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Tracker</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {snapshot.surveys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No survey requests logged yet.</p>
          ) : (
            snapshot.surveys.map((survey) => (
              <div key={survey.id} className="rounded-xl border p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{survey.location}</p>
                    <p className="text-xs text-muted-foreground">{survey.serviceType}</p>
                  </div>
                  <Badge variant={survey.status === "Completed & Sent" ? "default" : survey.status === "Rejected" ? "destructive" : survey.status === "In Progress" ? "secondary" : "outline"}>
                    {survey.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{survey.description}</p>
                {survey.status === "Completed & Sent" && survey.completedFileName && (
                  <a
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    href={buildSurveyDownloadHref(`Mock survey package for ${survey.location} (${survey.completedFileName})`)}
                    download={survey.completedFileName}
                  >
                    <Download className="h-4 w-4" />
                    Download completed file
                  </a>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
