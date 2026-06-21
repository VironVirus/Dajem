"use client";

import * as React from "react";
import { BarChart3, ClipboardList, Package, Shield, Users } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Select } from "./select";
import { useDajem } from "./dajem-provider";
import type { InventoryItem } from "../lib/store";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminView() {
  const {
    currentUser,
    snapshot,
    isBusy,
    updateBidStatus,
    updateInventoryItem,
    updateSurveyStatus,
    openAuthModal,
  } = useDajem();
  const [inventoryDrafts, setInventoryDrafts] = React.useState<Record<string, InventoryItem>>({});

  React.useEffect(() => {
    const nextDrafts = Object.fromEntries(snapshot.inventory.map((item) => [item.productId, item]));
    setInventoryDrafts(nextDrafts);
  }, [snapshot.inventory]);

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Please log in with an admin account to manage the Dajem group portal.</p>
          <Button className="bg-primary text-white" onClick={() => openAuthModal("login")}>
            Login as admin
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Admin Access Required</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This account is logged in, but it does not have admin privileges.
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { label: "Users", value: snapshot.users.length, icon: Users },
    { label: "Orders", value: snapshot.orders.length, icon: Package },
    { label: "Pending Bids", value: snapshot.bids.filter((bid) => bid.status === "Pending").length, icon: BarChart3 },
    { label: "Survey Queue", value: snapshot.surveys.filter((survey) => survey.status !== "Completed & Sent").length, icon: ClipboardList },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10 p-6">
        <Badge variant="secondary" className="mb-3">Shared Admin Portal</Badge>
        <h1 className="text-3xl font-bold text-primary dark:text-foreground">Dajem operations console</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage users, bids, surveys, inventory, and integration readiness from one shared workspace.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1">Backend: {snapshot.integrations.backend}</span>
          <span className="rounded-full border px-3 py-1">Supabase: {snapshot.integrations.supabaseConfigured ? "Ready" : "Fallback mode"}</span>
          <span className="rounded-full border px-3 py-1">Flutterwave: {snapshot.integrations.flutterwaveConfigured ? "Live handshake ready" : "Simulated checkout"}</span>
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

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.users.map((user) => (
              <div key={user.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{user.phone}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Bids</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.bids.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bids have been submitted yet.</p>
            ) : (
              snapshot.bids.map((bid) => (
                <div key={bid.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{bid.propertyTitle}</p>
                      <p className="text-xs text-muted-foreground">{bid.userName} • {bid.userEmail}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCurrency(bid.bidAmount)} against {formatCurrency(bid.propertyPrice)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => void updateBidStatus(bid.id, "Connected")}>
                        Connect
                      </Button>
                      <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => void updateBidStatus(bid.id, "Rejected")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Request Tracker</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {snapshot.surveys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No survey requests have been logged yet.</p>
          ) : (
            snapshot.surveys.map((survey) => (
              <div key={survey.id} className="rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{survey.location}</p>
                    <p className="text-xs text-muted-foreground">{survey.userName} • {survey.serviceType}</p>
                  </div>
                  <Shield className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{survey.description}</p>
                <Select
                  value={survey.status}
                  onChange={(event) => void updateSurveyStatus(survey.id, event.target.value as typeof survey.status)}
                  options={[
                    { value: "Pending", label: "Pending" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Completed & Sent", label: "Completed & Sent" },
                  ]}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poultry Inventory Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot.inventory.map((item) => {
            const draft = inventoryDrafts[item.productId] ?? item;
            return (
              <div key={item.productId} className="rounded-xl border p-4">
                <div className="mb-4 flex flex-col gap-1">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    type="number"
                    value={draft.price}
                    onChange={(event) => setInventoryDrafts((current) => ({
                      ...current,
                      [item.productId]: {
                        ...draft,
                        price: Number(event.target.value),
                      },
                    }))}
                  />
                  <Input
                    type="number"
                    value={draft.availableUnits}
                    onChange={(event) => setInventoryDrafts((current) => ({
                      ...current,
                      [item.productId]: {
                        ...draft,
                        availableUnits: Number(event.target.value),
                      },
                    }))}
                  />
                  <Select
                    value={draft.stockStatus}
                    onChange={(event) => setInventoryDrafts((current) => ({
                      ...current,
                      [item.productId]: {
                        ...draft,
                        stockStatus: event.target.value as InventoryItem["stockStatus"],
                      },
                    }))}
                    options={[
                      { value: "In Stock", label: "In Stock" },
                      { value: "Low Stock", label: "Low Stock" },
                      { value: "Out of Stock", label: "Out of Stock" },
                    ]}
                  />
                  <Button
                    disabled={isBusy}
                    onClick={() => void updateInventoryItem({
                      productId: item.productId,
                      price: draft.price,
                      availableUnits: draft.availableUnits,
                      stockStatus: draft.stockStatus,
                    })}
                  >
                    Save
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Current value: {formatCurrency(draft.price)}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
