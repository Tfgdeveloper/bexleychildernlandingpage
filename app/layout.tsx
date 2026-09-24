import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: "--font-raleway",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.bexleypublishing.com"),
    title: { default: "Bexley Publishing", template: "%s | Bexley Publishing" },
    icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={raleway.variable}>
            <body>
                {children}

                {/*
                  LIVE CHAT: paste your LiveChat widget script here (the same one your main site uses),
                  e.g. with next/script:
                  <Script id="livechat" strategy="afterInteractive">{`...your LiveChat snippet...`}</Script>
                  The "Live Chat" buttons on the page open it automatically once it's loaded.
                */}
            </body>
        </html>
    );
}
