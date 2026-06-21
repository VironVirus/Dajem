import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/styles/globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dajem Real Estate | Premium Property Listings",
  description:
    "Explore luxury apartments, commercial offices, industrial warehouses, and investment lands. High-quality property brokerage and management by Dajem Group.",
  keywords: ["Dajem Real Estate", "Property Listings", "Apartments for Rent", "Properties for Sale", "Abuja", "Nigeria"],
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
