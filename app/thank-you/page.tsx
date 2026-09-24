import type { Metadata } from "next";
import { CheckCircle2, Phone, Mail, ArrowLeft } from "lucide-react";
import { SITE } from "@/components/site";

export const metadata: Metadata = {
    title: "Thank You",
    robots: { index: false, follow: false },
};

export default function ThankYouPage() {
    return (
        <>
            <style>{`
                .ty { min-height: 100vh; background: #05070f; color: white; font-family: var(--font-raleway), Arial, sans-serif; display: flex; flex-direction: column; position: relative; overflow: hidden; }
                .ty::before { content: ""; position: absolute; top: 30%; left: 50%; width: 760px; height: 760px; transform: translate(-50%, -50%); border-radius: 50%; background: rgba(232,57,29,0.16); filter: blur(150px); pointer-events: none; }
                .ty::after { content: ""; position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 30px 30px; pointer-events: none; }
                .ty-head { position: relative; z-index: 2; padding: 24px 40px; }
                .ty-head img { height: 52px; width: auto; }
                .ty-body { position: relative; z-index: 2; flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px 80px; }
                .ty-card { max-width: 640px; text-align: center; }
                .ty-icon { width: 88px; height: 88px; margin: 0 auto 28px; border-radius: 50%; background: rgba(232,57,29,0.15); color: #e8391d; display: flex; align-items: center; justify-content: center; }
                .ty-h1 { font-weight: 900; text-transform: uppercase; line-height: 1; font-size: clamp(2.2rem, 5vw, 3.6rem); margin-bottom: 20px; }
                .ty-h1 span { color: #e8391d; }
                .ty-sub { color: rgba(255,255,255,0.65); line-height: 1.8; font-size: 16px; margin-bottom: 36px; }
                .ty-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 40px; text-align: left; }
                .ty-step { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 18px; }
                .ty-step b { display: block; color: #e8391d; font-size: 22px; font-weight: 900; margin-bottom: 6px; }
                .ty-step p { color: rgba(255,255,255,0.65); font-size: 13px; line-height: 1.6; }
                .ty-actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
                .ty-btn { display: inline-flex; align-items: center; gap: 10px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; padding: 15px 26px; border-radius: 12px; border: 2px solid transparent; transition: background 0.2s ease, color 0.2s ease; }
                .ty-btn.primary { background: #e8391d; color: white; }
                .ty-btn.primary:hover { background: #c0271a; }
                .ty-btn.ghost { border-color: rgba(255,255,255,0.5); color: white; }
                .ty-btn.ghost:hover { background: white; color: #05070f; }
                .ty-back { display: inline-flex; align-items: center; gap: 8px; margin-top: 32px; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 600; }
                .ty-back:hover { color: white; }
                @media (max-width: 640px) {
                    .ty-head { padding: 20px; } .ty-head img { height: 42px; }
                    .ty-steps { grid-template-columns: 1fr; }
                    .ty-actions { flex-direction: column; } .ty-btn { justify-content: center; }
                }
            `}</style>
            <main className="ty">
                <header className="ty-head">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={SITE.logo} alt={SITE.name} />
                </header>
                <section className="ty-body">
                    <div className="ty-card">
                        <div className="ty-icon"><CheckCircle2 size={44} /></div>
                        <h1 className="ty-h1">Thank you! <span>We've got your details.</span></h1>
                        <p className="ty-sub">
                            One of our illustration consultants will contact you shortly to talk about your book and confirm your discount.
                        </p>
                        <div className="ty-steps">
                            <div className="ty-step"><b>01</b><p>We review your project details.</p></div>
                            <div className="ty-step"><b>02</b><p>A consultant calls or emails you, usually within a few hours.</p></div>
                            <div className="ty-step"><b>03</b><p>You get a tailored plan and quote for your book.</p></div>
                        </div>
                        <div className="ty-actions">
                            <a href={SITE.phoneHref} className="ty-btn primary"><Phone size={16} /> Call {SITE.phone}</a>
                            <a href={`mailto:${SITE.email}`} className="ty-btn ghost"><Mail size={16} /> Email us</a>
                        </div>
                        <a href="/" className="ty-back"><ArrowLeft size={15} /> Back to the page</a>
                    </div>
                </section>
            </main>
        </>
    );
}
