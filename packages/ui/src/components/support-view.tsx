"use client";

import * as React from "react";
import { LifeBuoy, MessageCircle, Send } from "lucide-react";
import type { SupportTicketCategory } from "../lib/store";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Select } from "./select";
import { Textarea } from "./textarea";
import { useDajem } from "./dajem-provider";

const categories: SupportTicketCategory[] = ["Order & Delivery", "Survey", "Homes", "Account", "General"];

function ticketTone(status: string) {
  if (status === "Resolved" || status === "Closed") return "default" as const;
  if (status === "In Progress") return "secondary" as const;
  return "outline" as const;
}

export function SupportView() {
  const { currentUser, snapshot, createSupportTicket, isBusy, openAuthModal } = useDajem();
  const [category, setCategory] = React.useState<SupportTicketCategory>("General");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [orderId, setOrderId] = React.useState("");
  const [notice, setNotice] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    try {
      await createSupportTicket({ category, subject, message, orderId: orderId || undefined });
      setSubject("");
      setMessage("");
      setOrderId("");
      setCategory("General");
      setNotice("Your ticket has been sent. The team will update it here.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to submit your ticket.");
    }
  };

  if (!currentUser) {
    return <Card className="mx-auto max-w-xl border-dashed"><CardHeader><Badge variant="secondary" className="w-max">Customer Support</Badge><CardTitle>How can we help?</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Sign in to create a support ticket and keep every response in one place.</p><Button className="bg-primary text-primary-foreground" onClick={() => openAuthModal("login")}>Log in for support</Button></CardContent></Card>;
  }

  return <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
    <Card className="overflow-hidden"><CardHeader className="bg-gradient-to-br from-slate-950 to-blue-950 text-white"><Badge variant="secondary" className="w-max">DAJEM Support</Badge><CardTitle className="text-white">Open a support ticket</CardTitle><p className="text-sm text-slate-200">Orders, farm delivery, surveys, homes, and account help.</p></CardHeader><CardContent className="p-5"><form className="space-y-4" onSubmit={(event) => void submit(event)}><Select label="What do you need help with?" value={category} onChange={(event) => setCategory(event.target.value as SupportTicketCategory)} options={categories.map((value) => ({ value, label: value }))} /><div className="space-y-1.5"><Label htmlFor="support-subject">Subject</Label><Input id="support-subject" required value={subject} maxLength={140} onChange={(event) => setSubject(event.target.value)} placeholder="For example: Delivery confirmation" /></div><Select label="Related order (optional)" value={orderId} onChange={(event) => setOrderId(event.target.value)} options={[{ value: "", label: "No related order" }, ...snapshot.orders.map((order) => ({ value: order.id, label: `${order.invoiceNumber} · ${order.paymentStatus}` }))]} /><div className="space-y-1.5"><Label htmlFor="support-message">Tell us what happened</Label><Textarea id="support-message" required value={message} maxLength={3000} onChange={(event) => setMessage(event.target.value)} placeholder="Include the details that will help the team assist you." /></div>{notice && <p className="rounded-xl bg-muted p-3 text-sm text-foreground">{notice}</p>}<Button type="submit" disabled={isBusy} className="w-full bg-primary text-primary-foreground"><Send className="h-4 w-4" />Send ticket</Button></form></CardContent></Card>
    <Card><CardHeader><Badge variant="secondary" className="w-max">Your tickets</Badge><CardTitle>Support activity</CardTitle></CardHeader><CardContent className="space-y-3">{snapshot.supportTickets.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center"><LifeBuoy className="mx-auto h-7 w-7 text-primary" /><p className="mt-3 text-sm font-bold text-foreground">No tickets yet</p><p className="mt-1 text-xs text-muted-foreground">Start a ticket whenever you need help.</p></div> : snapshot.supportTickets.map((ticket) => <article key={ticket.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold text-foreground">{ticket.subject}</p><p className="mt-1 text-xs text-muted-foreground">{ticket.category} · {new Date(ticket.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p></div><Badge variant={ticketTone(ticket.status)}>{ticket.status}</Badge></div><p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{ticket.message}</p>{ticket.orderId && <p className="mt-3 text-xs font-bold text-primary">Order: {ticket.orderId}</p>}{ticket.adminNote && <div className="mt-3 rounded-xl bg-primary/5 p-3 text-sm"><p className="flex items-center gap-1.5 font-bold text-foreground"><MessageCircle className="h-4 w-4 text-primary" />DAJEM support</p><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{ticket.adminNote}</p></div>}</article>)}</CardContent></Card>
  </div>;
}
