import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DevUserSwitcher } from "@/components/layout/dev-user-switcher";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Ridely — Fast, Reliable & Safe Rides Across India",
  description: "Book city cabs, autos, and bikes in seconds with upfront pricing and live tracking.",
};

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-[#F6F8FA] text-[#0B1220]">
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <DevUserSwitcher />
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
