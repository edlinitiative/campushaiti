import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Haiti - University Application Platform",
  description: "Apply to universities in Haiti with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
