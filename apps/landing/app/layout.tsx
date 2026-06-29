import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dajem Group Limited | Strategic Management",
  description:
    "Dajem Group Limited owns and controls the subsidiary companies of Dajem Group and facilitates strategic management across Dajem Farms, Dajem Homes, and Dajem Orbital Resources.",
  keywords: ["Dajem Group Limited", "Dajem Farms Limited", "Dajem Homes Limited", "Dajem Orbital Resources Limited", "Enugu", "Nigeria"],
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
