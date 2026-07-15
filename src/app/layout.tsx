import type { Metadata } from "next";
import { AppProvider } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaRise - Premium Crowdfunding Platform",
  description: "Raise money for your projects, causes, and innovative products with NovaRise.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <AppProvider>
          <Navbar />
          <div className="flex-grow">{children}</div>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
