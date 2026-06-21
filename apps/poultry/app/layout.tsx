import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/styles/globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dajem Poultry | Quality Feeds & Breeds",
  description:
    "We provide premium day-old chicks, high-quality organic feeds, standard processing equipment, and fresh farm broilers. Certified agricultural solutions by Dajem Group.",
  keywords: ["Dajem Poultry", "Poultry Farming", "Day Old Chicks", "Organic Feed", "Abuja", "Nigeria"],
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
