import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DAJEM Group Limited | Strategic Management",
  description:
    "DAJEM Group Limited coordinates the subsidiary companies of the DAJEM group and provides shared strategic management across DAJEM Farms, DAJEM Homes, and DAJEM Orbital Resources.",
  keywords: ["DAJEM Group Limited", "DAJEM Farms Limited", "DAJEM Homes Limited", "DAJEM Orbital Resources Limited", "Enugu", "Nigeria"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
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
