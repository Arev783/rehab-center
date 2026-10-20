import type { Metadata } from "next";
import { Noto_Sans_Armenian } from "next/font/google";
import "./globals.css";

const notoSansArmenian = Noto_Sans_Armenian({
  variable: "--font-sans",
  subsets: ["armenian", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Rehab Center",
    template: "%s | Rehab Center",
  },
  description: "Ռեաբիլիտացիոն կենտրոնի կառավարման համակարգ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="hy"
      className={`${notoSansArmenian.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}