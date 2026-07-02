import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DAJEM Orbital Resources Limited | Surveying, Mapping & Contracts",
  description:
    "DAJEM Orbital Resources Limited handles land surveying, digital mapping, geoinformatics, development management, architectural designs, civil engineering, logistics, haulage, and general contracts.",
  keywords: ["DAJEM Orbital Resources Limited", "Land Surveying", "Digital Mapping", "Geoinformatics", "Architectural Designs", "Civil Engineering", "Enugu", "Nigeria"],
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
