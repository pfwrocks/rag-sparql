import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "Datacrate - Demo",
  description: "Datacrate -  Demo",
};

import { Metadata } from "next";
import "../global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}<Analytics/></body>
    </html>
  );
}
