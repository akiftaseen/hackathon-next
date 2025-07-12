import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANKID - AI Learning Tutor",
  description: "Your personal AI tutor for natural conversation-based learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Feather:wght@300;400;700&family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Feather', 'Fredoka', sans-serif", fontWeight: "700", fontSize: "1.25rem" }}>
        {children}
      </body>
    </html>
  );
}
