export const metadata: Metadata = {
  title: "LLM Demo",
  description: "LLM Demo",
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
      <body>{children}</body>
    </html>
  );
}
