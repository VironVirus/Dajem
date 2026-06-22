import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/styles/globals.css";
import { DajemProvider, ThemeProvider } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dajem Farms Limited | Farming & Farm Products",
  description:
    "Dajem Farms Limited handles farming generally, including farm products, livestock, feeds, and agricultural operations from Enugu, Nigeria.",
  keywords: ["Dajem Farms Limited", "Farming", "Farm Products", "Poultry", "Enugu", "Nigeria"],
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
