import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/styles/globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dajem Homes Limited | Homes, Hospitality & Property",
  description:
    "Dajem Homes Limited handles short-let apartments and suites, hotel management, hospitality management, real estate development, sales, marketing, consultancy, and property management.",
  keywords: ["Dajem Homes Limited", "Short-let Apartments", "Hotel Management", "Real Estate Development", "Property Management", "Enugu", "Nigeria"],
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
