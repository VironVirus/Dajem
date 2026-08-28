import type { Metadata } from "next";
import "./globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

export const metadata: Metadata = {
  title: "DAJEM Group Limited | Farms, Homes, Survey & Strategic Management",
  description:
    "One unified DAJEM platform for strategic management, DAJEM Farms, DAJEM Homes, and DAJEM Orbital survey services.",
  keywords: ["DAJEM Group Limited", "DAJEM Farms Limited", "DAJEM Homes Limited", "DAJEM Orbital Resources Limited", "Enugu", "Nigeria"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DajemProvider>{children}</DajemProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
