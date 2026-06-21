import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/styles/globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dajem Survey & Plans | Professional Surveying & Geomatics",
  description:
    "Precision surveying, boundary demarkation, engineering surveys, GIS mapping, and architectural plans. Licensed geomatics professionals by Dajem Group.",
  keywords: ["Dajem Survey", "Land Surveying", "GIS Mapping", "Architectural Plans", "Abuja", "Nigeria"],
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
