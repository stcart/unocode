import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Практика UnoCode",
  description: "Сервис для организации и сопровождения практики",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <SiteHeader />
          <main className="surface-grid flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
