import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { SITE } from "@/components/site";

const LEGAL_LINKS = [
    { label: "Terms & Conditions", href: "/terms-of-use" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
];

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
    return (
        <>
            <style>{`
                .lg { min-height: 100vh; background: #faf9f7; color: #05070f; font-family: var(--font-raleway), Arial, sans-serif; display: flex; flex-direction: column; }
                .lg-top { background: #05070f; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
                .lg-top img { height: 48px; width: auto; }
                .lg-top a.back { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 700; }
                .lg-top a.back:hover { color: white; }
                .lg-hero { background: #05070f; padding: 48px 40px 64px; border-bottom: 4px solid #e8391d; }
                .lg-hero h1 { max-width: 820px; margin: 0 auto; color: white; font-weight: 900; text-transform: uppercase; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.05; }
                .lg-hero p { max-width: 820px; margin: 12px auto 0; color: rgba(255,255,255,0.5); font-size: 13px; }
                .lg-body { flex: 1; width: 100%; max-width: 820px; margin: 0 auto; padding: 56px 40px 88px; }
                .lg-body h2 { font-weight: 900; text-transform: uppercase; font-size: 17px; letter-spacing: 0.04em; margin: 36px 0 12px; }
                .lg-body h2:first-child { margin-top: 0; }
                .lg-body p, .lg-body li { color: #4b5563; font-size: 15px; line-height: 1.85; }
                .lg-body p + p { margin-top: 12px; }
                .lg-body ul { padding-left: 20px; margin: 8px 0 0; }
                .lg-body a { color: #e8391d; font-weight: 700; }
                .lg-note { background: #fff4e5; border: 1px solid #ffd8a8; color: #8a4b00 !important; padding: 14px 16px; border-radius: 10px; font-size: 13px !important; margin-bottom: 32px; }
                .lg-foot { background: #05070f; color: rgba(255,255,255,0.55); padding: 24px 40px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13px; }
                .lg-foot nav { display: flex; flex-wrap: wrap; gap: 22px; }
                .lg-foot a:hover, .lg-foot a[aria-current="page"] { color: #e8391d; }
                @media (max-width: 640px) {
                    .lg-top, .lg-hero, .lg-foot { padding-left: 20px; padding-right: 20px; }
                    .lg-body { padding: 40px 20px 64px; }
                    .lg-foot { flex-direction: column; align-items: center; text-align: center; }
                }
            `}</style>
            <div className="lg">
                <header className="lg-top">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={SITE.logo} alt={SITE.name} />
                    <a href="/" className="back"><ArrowLeft size={15} /> Back</a>
                </header>
                <div className="lg-hero">
                    <h1>{title}</h1>
                    <p>Last updated: {updated}</p>
                </div>
                <main className="lg-body">{children}</main>
                <footer className="lg-foot">
                    <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
                    <nav aria-label="Legal">{LEGAL_LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>
                </footer>
            </div>
        </>
    );
}
