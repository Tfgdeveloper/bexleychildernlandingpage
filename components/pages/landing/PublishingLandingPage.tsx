"use client";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
    ArrowRight, Phone, Mail, MapPin, Send, Star, X, Loader2, BadgeCheck, AlertCircle, Check, Plus,
    PenTool, SpellCheck, Palette, LayoutTemplate, Globe, Megaphone, Headphones, MonitorSmartphone,
    CalendarDays, PhoneCall, Trophy, BookOpen, Users, Percent, Crown, ShieldCheck, Handshake,
    FileText, Rocket, Search, Clock, Award,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   EDIT THESE — contact details, links & image paths
══════════════════════════════════════════════════════════════ */
const BRAND = {
    name: "Bexley Publishing",
    phone: "(279) 777-0380",
    phoneHref: "tel:2797770380",
    email: "info@bexleypublishing.com",
    headOffice: "2390 Fruitridge Rd Sacramento, CA 95822",
};

/* "Book a Meeting" — put your Calendly (or similar) link here.
   Leave empty and the button opens the Get Started popup instead. */
const MEETING_URL = "";

const IMG = {
    headerLogo: "/images/Bexley-Publishing-03.png",
    footerLogo: "/images/Bexley-Publishing-03.png",
    cta1: "/images/publishing/cta-books-1.png",
    cta2: "/images/publishing/cta-books-2.png",
    popup: "/images/page/popup-img.png",
};

/* Any image that's missing automatically falls back to a designed "book cover"
   or a text logo, so the page never looks broken while you add files. */

/* ══════════════════════════════════════════════════════════════
   LEAD FORM SUBMISSION (CRM) — same as the children's page
══════════════════════════════════════════════════════════════ */
type Status = "idle" | "loading" | "error";
const LEAD_URL = "https://crm.authorssale.com/api/lead/L6RQei7pdOcTUyOSaGLKvGjguhnurLb9";
const MAX_ATTEMPTS = 3;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function postWithRetry(url: string, body: unknown): Promise<Response> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.status >= 500 && attempt < MAX_ATTEMPTS) {
                await wait(600 * attempt);
                continue;
            }
            return res;
        } catch (err) {
            lastError = err;
            if (attempt < MAX_ATTEMPTS) await wait(600 * attempt);
        }
    }
    throw lastError;
}

function useLeadForm(defaultService = "Book Publishing") {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", phone: "", service: defaultService, message: "" });
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (status === "error") setStatus("idle");
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");
        /* The API has no service field, so the service is added to the top of the message. */
        const fullMessage = form.service ? `Service: ${form.service}\n\n${form.message}` : form.message;
        try {
            const res = await postWithRetry(LEAD_URL, {
                Name: form.name,
                Email: form.email,
                "Phone Number": form.phone,
                Message: fullMessage,
            });
            // 409 = duplicate entry, treat as success and redirect
            if (!res.ok && res.status !== 409) throw new Error(`Server responded with ${res.status}`);
            router.push("/thank-you");
        } catch {
            setErrorMsg("Something went wrong. Please try again or call us directly.");
            setStatus("error");
        }
    };

    return { form, status, errorMsg, handle, submit };
}

/* Landing page: only legal pages in the footer + /thank-you after submit */
const LEGAL_LINKS = [
    { label: "Terms & Conditions", href: "/terms-of-use" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
];

const POPUP_MIN_WIDTH = 1024;
const POPUP_EVENT = "pb:open-popup";

/* ══════════════════════════════════════════════════════════════
   ANIMATION
══════════════════════════════════════════════════════════════ */
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const maskReveal: Variants = {
    hidden: { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", y: 40 },
    visible: { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", y: 0, transition: { duration: 1, ease: smoothEase } },
};
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: smoothEase } },
};
const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

/* ══════════════════════════════════════════════════════════════
   ACTIONS
══════════════════════════════════════════════════════════════ */
function scrollToForm() {
    document.getElementById("pb-hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* "Get a Quote" / "Get Started": popup on web, scroll to hero form on tablet & mobile */
function getStarted() {
    if (typeof window === "undefined") return;
    if (window.matchMedia(`(min-width: ${POPUP_MIN_WIDTH}px)`).matches) window.dispatchEvent(new Event(POPUP_EVENT));
    else scrollToForm();
}

function bookMeeting() {
    if (MEETING_URL) window.open(MEETING_URL, "_blank", "noopener,noreferrer");
    else getStarted();
}

/* ══════════════════════════════════════════════════════════════
   IMAGE HELPERS
══════════════════════════════════════════════════════════════ */
const TONES = [
    { bg: "linear-gradient(160deg,#e8391d,#8f1c0c)", fg: "#fff", accent: "#ffc83d" },
    { bg: "linear-gradient(160deg,#1b2340,#05070f)", fg: "#fff", accent: "#e8391d" },
    { bg: "linear-gradient(160deg,#ffc83d,#f29a1f)", fg: "#05070f", accent: "#e8391d" },
    { bg: "linear-gradient(160deg,#faf9f7,#e8e1d4)", fg: "#05070f", accent: "#e8391d" },
    { bg: "linear-gradient(160deg,#2d6f9e,#123049)", fg: "#fff", accent: "#ffc83d" },
    { bg: "linear-gradient(160deg,#3b2a4f,#140d20)", fg: "#fff", accent: "#e8391d" },
];

/* Detects images that failed before React hydrated (onError alone misses those) */
function useImgFallback() {
    const ref = useRef<HTMLImageElement>(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        const img = ref.current;
        if (img && img.complete && img.naturalWidth === 0) setFailed(true);
    }, []);
    return { ref, failed, onError: () => setFailed(true) };
}

/* Real cover image if it exists, otherwise a designed placeholder cover */
function BookCover({ src, title, author, tone = 0, className = "" }: { src: string; title: string; author: string; tone?: number; className?: string }) {
    const { ref, failed, onError } = useImgFallback();
    if (!failed && src) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img ref={ref} src={src} alt={`${title} book cover`} className={`pb-cover ${className}`} loading="lazy" onError={onError} />;
    }
    const t = TONES[tone % TONES.length];
    return (
        <div className={`pb-cover pb-faux ${className}`} style={{ background: t.bg, color: t.fg }} role="img" aria-label={`${title} book cover`}>
            <span className="pb-faux-bar" style={{ background: t.accent }} />
            <strong>{title}</strong>
            <em>{author}</em>
        </div>
    );
}

/* Logo image if it exists, otherwise the name as a clean wordmark */
function LogoMark({ src, name }: { src: string; name: string }) {
    const { ref, failed, onError } = useImgFallback();
    if (failed) return <span className="pb-wordmark">{name}</span>;
    // eslint-disable-next-line @next/next/no-img-element
    return <img ref={ref} src={src} alt={name} className="pb-logo-mark" loading="lazy" onError={onError} />;
}

function PlainImg({ src, alt, className = "", fallback }: { src: string; alt: string; className?: string; fallback: ReactNode }) {
    const { ref, failed, onError } = useImgFallback();
    if (failed) return <>{fallback}</>;
    // eslint-disable-next-line @next/next/no-img-element
    return <img ref={ref} src={src} alt={alt} className={className} loading="lazy" onError={onError} />;
}

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
// Hero shelf: /public/images/publishing/hero/book-1.png … book-8.png
const heroBooks = [
    { title: "Holiday", author: "M. Carter" },
    { title: "The Split", author: "Sharon Bolton" },
    { title: "Winter Notes", author: "A. Hale" },
    { title: "Her Husband's Secret", author: "L. Moore" },
    { title: "Beren & Luthien", author: "R. Vance" },
    { title: "The Courage of Hope", author: "D. Price" },
    { title: "Three", author: "K. Lowe" },
].map((b, i) => ({ ...b, src: `/images/publishing/hero/book-${i + 1}.png` }));

// Logo strips: /public/images/publishing/platforms/<slug>.png
const retailers = ["Amazon Kindle", "Barnes & Noble", "Kobo", "Apple Books", "Google Play Books", "Draft2Digital", "IngramSpark", "Smashwords"];
const reviewSites = ["Trustpilot", "Reviews.io", "Bark", "Sitejabber", "GoodFirms", "Clutch"];

const genres = [
    { title: "Children's Books", book: "Baby's Story Time", items: ["Cover Design", "eBook", "Illustrations", "Interior Formatting", "Hardcover Printing"] },
    { title: "Novels", book: "My Father's Words", items: ["Cover Design", "Editing", "Interior Formatting", "Illustrations", "Marketing"] },
    { title: "Art Books", book: "The Colour Tale", items: ["Cover Design", "Editing", "Interior Formatting", "Printing"] },
    { title: "Cookbooks", book: "Kitchen Conversations", items: ["Cover Design", "Editing", "Interior Formatting", "Hardcover Printing"] },
    { title: "Fiction", book: "The Archer's Thread", items: ["Cover Design", "eBook", "Editing", "Interior Formatting"] },
    { title: "Non-Fiction", book: "Emotions From My Wine Glass", items: ["Cover Design", "eBook", "Editing", "Interior Formatting", "Marketing"] },
].map((g) => ({ ...g, src: `/images/publishing/genres/${slug(g.title)}.png` }));

// Award badges: /public/images/publishing/awards/award-1.png … award-6.png
const awards = Array.from({ length: 6 }, (_, i) => `/images/publishing/awards/award-${i + 1}.png`);

// Portfolio: /public/images/publishing/portfolio/<category>-<n>.webp
const portfolioCats = ["Comics", "Drama", "Children's Book", "Health", "Horror", "Romance", "Travel", "Law", "Cookbook", "Biography", "History"];
const sampleTitles = ["The Last Letter", "Beyond the Tide", "Midnight Orchard", "Paper Crowns", "Salt & Stone", "The Quiet Year", "Northbound", "Glass Harbor", "Ember Road"];

const services = [
    { icon: PenTool, title: "Ghostwriting", desc: "Professional writers turn your ideas, notes or recordings into a complete manuscript in your voice." },
    { icon: SpellCheck, title: "Editing & Proofreading", desc: "Developmental, line and copy editing that tightens structure and removes every error." },
    { icon: Palette, title: "Cover Design", desc: "Genre-aware covers designed to stand out as a thumbnail and on a bookstore shelf." },
    { icon: LayoutTemplate, title: "Formatting & Typesetting", desc: "Clean interior layouts for eBook, paperback and hardcover that meet every platform's specs." },
    { icon: Globe, title: "Publishing & Distribution", desc: "We publish your book on Amazon, Barnes & Noble, Kobo, Apple Books and 40,000+ outlets." },
    { icon: Megaphone, title: "Book Marketing", desc: "Launch plans, Amazon ads, social media and review campaigns that put your book in front of readers." },
    { icon: Headphones, title: "Audiobook Production", desc: "Professional narration, editing and mastering, published on Audible, Apple and Google." },
    { icon: MonitorSmartphone, title: "Author Website", desc: "A fast, professional author website that grows your readership and sells your books." },
];

const processSteps = [
    { icon: Handshake, title: "Connect With Us", desc: "Send us a message with details of your project. We'll get back to you and answer every question you have." },
    { icon: FileText, title: "Draft Reviews", desc: "Submit your complete draft, or let us write it. Our experts review it and share how they'll help." },
    { icon: Search, title: "Editing & Formatting", desc: "Our editors proofread, edit and format your manuscript to industry standards." },
    { icon: Palette, title: "Cover Design", desc: "Our designers create a front and back cover that makes readers pick your book up." },
    { icon: Rocket, title: "Book Publishing", desc: "We publish your book in print, digital and on-demand formats across every major platform." },
];

const stats = [
    { icon: BookOpen, num: "500+", label: "Books published" },
    { icon: Users, num: "300+", label: "Happy authors" },
    { icon: Crown, num: "12+", label: "Years of experience" },
    { icon: Percent, num: "100%", label: "Royalties kept by you" },
];

const whyPoints = [
    "A dedicated consultant and project manager from first call to launch day",
    "You keep 100% of your rights and 100% of your royalties",
    "Editors, designers and marketers all under one roof",
    "Clear pricing, organized timelines and no hidden fees",
    "Global distribution in print, eBook and audiobook formats",
];

const TRUST = { score: "4.9", label: "Excellent", reviews: "300+" };

const testimonials = [
    { name: "Kevin Stock", location: "US", date: "Aug 18, 2026", rating: 5, title: "Exceeded every expectation", quote: "On my wife's recommendation I ordered a book I'd been putting off for four years. The writing quality surprised me, and readers are responding really well." },
    { name: "Priya Nair", location: "GB", date: "Aug 02, 2026", rating: 5, title: "From cover to launch, handled", quote: "Cover design, formatting, publishing — they handled every technical detail with precision and kept me updated throughout." },
    { name: "Samantha Thornhill", location: "US", date: "Jul 21, 2026", rating: 5, title: "Finally a team that gets it", quote: "After wasting time with inexperienced freelancers, Bexley understood my book idea straight away. Editing and design were outstanding." },
    { name: "David Torres", location: "CA", date: "Jul 05, 2026", rating: 5, title: "My manuscript became a real book", quote: "They took my unfinished manuscript and turned it into a well-crafted book ready for publication. Highly recommended." },
    { name: "Emily Rose", location: "AU", date: "Jun 14, 2026", rating: 5, title: "Marketing that actually worked", quote: "The launch plan got my book into the top 100 of its Amazon category in the first week. Great communication all along." },
];

const faqs = [
    { q: "How long does it take to publish my book?", a: "Most books are published within 6–12 weeks, depending on length and which services you need. Your project manager gives you a clear timeline on day one." },
    { q: "Do I keep the rights and royalties to my book?", a: "Yes. You keep 100% of the rights to your work and 100% of your royalties. We never take a share of your book sales." },
    { q: "Where will my book be available?", a: "We publish on Amazon, Barnes & Noble, Kobo, Apple Books, Google Play Books and through wide distribution to thousands of retailers and libraries worldwide." },
    { q: "I only have an idea. Can you still help?", a: "Absolutely. Our ghostwriters can take your idea, notes or voice recordings and turn them into a complete manuscript written in your voice." },
    { q: "Can I publish in paperback, hardcover and eBook?", a: "Yes. We format and publish your book in every format you want, including audiobook." },
    { q: "How much does it cost?", a: "Pricing depends on your book and the services you choose. Fill in the form for a free consultation and a custom quote with up to 50% off." },
];

/* ══════════════════════════════════════════════════════════════
   SMALL SHARED PIECES
══════════════════════════════════════════════════════════════ */
function Eyebrow({ children, center = false, light = false }: { children: ReactNode; center?: boolean; light?: boolean }) {
    return (
        <div className={`pb-eyebrow ${center ? "center" : ""} ${light ? "light" : ""}`}>
            <span className="pb-eyebrow-line" />
            <span className="pb-eyebrow-text">{children}</span>
            {center && <span className="pb-eyebrow-line" />}
        </div>
    );
}

function CtaButtons({ onDark = true }: { onDark?: boolean }) {
    return (
        <div className="pb-actions">
            <button type="button" className="pb-btn pb-btn-primary" onClick={getStarted}>Get A Quote <ArrowRight size={16} /></button>
            <button type="button" className={`pb-btn ${onDark ? "pb-btn-light" : "pb-btn-dark"}`} onClick={bookMeeting}><CalendarDays size={16} /> Book A Meeting</button>
            <a href={BRAND.phoneHref} className={`pb-btn ${onDark ? "pb-btn-ghost" : "pb-btn-ghost-dark"}`}><PhoneCall size={16} /> Toll Free {BRAND.phone}</a>
        </div>
    );
}

function SectionHead({ eyebrow, title, accent, sub, light = false }: { eyebrow: string; title: string; accent: string; sub?: string; light?: boolean }) {
    return (
        <div className="pb-section-head">
            <Eyebrow center light={light}>{eyebrow}</Eyebrow>
            <motion.h2 variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`pb-h2 ${light ? "light" : ""}`}>
                {title} <span className="accent">{accent}</span>
            </motion.h2>
            {sub && <p className={`pb-sub ${light ? "light" : ""}`}>{sub}</p>}
        </div>
    );
}

function Marquee({ items, dark = false, label }: { items: string[]; dark?: boolean; label: string }) {
    const row = [...items, ...items];
    return (
        <div className={`pb-marquee ${dark ? "dark" : ""}`} aria-label={label}>
            <div className="pb-marquee-track">
                {row.map((name, i) => (
                    <div key={`${name}-${i}`} className="pb-marquee-item" aria-hidden={i >= items.length}>
                        <LogoMark src={`/images/publishing/platforms/${slug(name)}.png`} name={name} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrustStars({ rating, size = 22 }: { rating: number; size?: number }) {
    return (
        <div className="pb-tp-stars" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`pb-tp-star ${i < Math.round(rating) ? "on" : ""}`} style={{ width: size, height: size }}>
                    <Star size={size * 0.62} fill="white" stroke="white" />
                </span>
            ))}
        </div>
    );
}

function FormError({ msg, light = false }: { msg: string; light?: boolean }) {
    return <p className={`pb-form-err ${light ? "light" : ""}`} role="alert"><AlertCircle size={15} /> {msg}</p>;
}

/* ══════════════════════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════════════════════ */
function Header() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
        <header className={`pb-header ${scrolled ? "scrolled" : ""}`}>
            <div className="pb-header-inner">
                <a href="#top" className="pb-logo" aria-label={`${BRAND.name}, back to top`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMG.headerLogo} alt={BRAND.name} className="pb-logo-img" />
                </a>
                <div className="pb-header-right">
                    <a href={BRAND.phoneHref} className="pb-header-phone" aria-label={`Call ${BRAND.phone}`}>
                        <span className="pb-header-phone-icon"><Phone size={15} /></span>
                        <span className="pb-header-phone-text"><small>Call us</small>{BRAND.phone}</span>
                    </a>
                    <button type="button" className="pb-btn pb-btn-primary pb-btn-sm" onClick={getStarted}>Get Started</button>
                </div>
            </div>
        </header>
    );
}

/* ══════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════ */
function HeroForm() {
    const { form, status, errorMsg, handle, submit } = useLeadForm();
    const loading = status === "loading";
    return (
        <motion.form
            id="pb-hero-form"
            className="pb-hero-form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: smoothEase }}
        >
            <div className="pb-hero-form-offer">
                <p>Discount{" "}<br />Reserved</p>
                <span className="pb-badge-50">50%<small>off</small></span>
            </div>
            <div className="pb-hero-form-fields">
                <input name="name" type="text" placeholder="Full name *" required aria-label="Full name" value={form.name} onChange={handle} disabled={loading} />
                <input name="email" type="email" placeholder="Email address *" required aria-label="Email address" value={form.email} onChange={handle} disabled={loading} />
                <input name="phone" type="tel" placeholder="Phone number *" required aria-label="Phone number" value={form.phone} onChange={handle} disabled={loading} />
            </div>
            <div className="pb-hero-form-msg">
                <textarea name="message" placeholder="Tell us about your project" aria-label="Tell us about your project" value={form.message} onChange={handle} disabled={loading} />
                <button type="submit" className="pb-btn pb-btn-primary pb-btn-block" disabled={loading}>
                    {loading ? <><Loader2 size={16} className="pb-spin" /> Sending…</> : <>Talk To An Expert <Send size={15} /></>}
                </button>
            </div>
            {status === "error" && <div className="pb-hero-form-err"><FormError msg={errorMsg} /></div>}
        </motion.form>
    );
}

function Hero() {
    return (
        <section className="pb-hero">
            <div className="pb-hero-dots" />
            <div className="pb-hero-glow" />
            <div className="pb-inner pb-hero-inner">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <Eyebrow center light>Your gateway to professional publishing</Eyebrow>
                </motion.div>
                <motion.h1 variants={maskReveal} initial="hidden" animate="visible" className="pb-hero-h1">
                    Book Publishing Starts With <span className="accent">Bexley Publishing</span>
                </motion.h1>
                <motion.p variants={fadeUp} initial="hidden" animate="visible" className="pb-hero-sub">
                    We help you bring your story to life exactly the way you imagine it. Keep full creative control, keep 100% of your royalties, and get expert guidance from a dedicated consultant and project manager at every step.
                </motion.p>
                <HeroForm />
            </div>

            {/* Book shelf rising from the bottom */}
            <div className="pb-shelf" aria-hidden="true">
                {heroBooks.map((b, i) => (
                    <motion.div
                        key={b.title}
                        className={`pb-shelf-book b${i + 1}`}
                        initial={{ y: 160, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.9 + i * 0.08, ease: smoothEase }}
                    >
                        <BookCover src={b.src} title={b.title} author={b.author} tone={i} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   GENRES
══════════════════════════════════════════════════════════════ */
function Genres() {
    return (
        <section className="pb-genres">
            <div className="pb-inner">
                <SectionHead eyebrow="What we publish" title="Publishing Solutions For" accent="Every Genre" sub="Whatever you're writing, we have editors, designers and marketers who specialize in it." />
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="pb-genre-grid">
                    {genres.map((g, i) => (
                        <motion.article key={g.title} variants={fadeUp} className="pb-genre-card">
                            <div className="pb-genre-art">
                                <span className="pb-genre-ring" />
                                <BookCover src={g.src} title={g.book} author="Bexley Author" tone={i + 1} className="pb-genre-cover" />
                            </div>
                            <h3 className="pb-genre-title">{g.title}</h3>
                            <ul className="pb-genre-list">
                                {g.items.map((it) => <li key={it}><Check size={14} /> {it}</li>)}
                            </ul>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   CTA BAND (used twice)
══════════════════════════════════════════════════════════════ */
function CtaBand({ eyebrow, title, text, image, badge }: { eyebrow: string; title: ReactNode; text: string; image: string; badge?: boolean }) {
    return (
        <section className="pb-band">
            <div className="pb-band-bg" aria-hidden="true" />
            <div className="pb-inner pb-band-inner">
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pb-band-copy">
                    <motion.p variants={fadeUp} className="pb-band-eyebrow">{eyebrow}</motion.p>
                    <motion.h2 variants={maskReveal} className="pb-band-h2">{title}</motion.h2>
                    <motion.p variants={fadeUp} className="pb-band-text">{text}</motion.p>
                    <motion.div variants={fadeUp}><CtaButtons /></motion.div>
                </motion.div>
                <motion.div
                    className="pb-band-art"
                    initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: smoothEase }}
                >
                    <PlainImg
                        src={image} alt="Books published by Bexley Publishing" className="pb-band-img"
                        fallback={
                            <div className="pb-band-stack">
                                <BookCover src="" title="Love On The Line" author="J. Carson" tone={3} className="s1" />
                                <BookCover src="" title="Cold Lake" author="Jeff Carson" tone={4} className="s2" />
                                <BookCover src="" title="Sorry For His Life" author="M. Lane" tone={0} className="s3" />
                            </div>
                        }
                    />
                    {badge && (
                        <div className="pb-band-chip">
                            <b>100%</b>
                            <span>Royalties on<br />eBook sales</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

function AwardsStrip() {
    return (
        <section className="pb-awards">
            <div className="pb-inner pb-awards-inner">
                <p className="pb-awards-label"><Trophy size={22} /> Award-winning book creation is our forte</p>
                <div className="pb-awards-row">
                    {awards.map((src, i) => (
                        <motion.div
                            key={src} className="pb-award"
                            initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.07, ease: smoothEase }}
                        >
                            <PlainImg src={src} alt={`Award ${i + 1}`} fallback={<span className="pb-award-fallback"><Award size={26} /></span>} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   PORTFOLIO
══════════════════════════════════════════════════════════════ */
function Portfolio() {
    const [active, setActive] = useState(portfolioCats[0]);
    const items = Array.from({ length: 9 }, (_, i) => ({
        src: `/images/publishing/portfolio/${slug(active)}-${i + 1}.webp`,
        title: sampleTitles[(i + portfolioCats.indexOf(active)) % sampleTitles.length],
    }));
    return (
        <section className="pb-portfolio">
            <div className="pb-inner">
                <SectionHead
                    eyebrow="Our portfolio" title="Recently We Published" accent="These Books"
                    sub="Our portfolio is full of best-sellers. We've handed the copyrights of award-winning titles to their authors around the world, with 100% anonymity."
                />
                <div className="pb-tabs" role="tablist" aria-label="Book categories">
                    {portfolioCats.map((c) => (
                        <button key={c} type="button" role="tab" aria-selected={active === c} className={`pb-tab ${active === c ? "active" : ""}`} onClick={() => setActive(c)}>
                            {c}
                            {active === c && <motion.span layoutId="pb-tab-pill" className="pb-tab-pill" transition={{ duration: 0.4, ease: smoothEase }} />}
                        </button>
                    ))}
                </div>
                <motion.div layout className="pb-gallery">
                    <AnimatePresence mode="popLayout">
                        {items.map((b, i) => (
                            <motion.div
                                key={b.src} layout className="pb-gallery-item"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
                                transition={{ duration: 0.45, delay: i * 0.03, ease: smoothEase }}
                            >
                                <BookCover src={b.src} title={b.title} author={active} tone={i} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   SERVICES
══════════════════════════════════════════════════════════════ */
function Services() {
    return (
        <section className="pb-services">
            <div className="pb-inner">
                <SectionHead eyebrow="Our services" title="Everything Your Book Needs," accent="Under One Roof" sub="Pick one service or let us take care of the whole journey, from blank page to best-seller list." />
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="pb-service-grid">
                    {services.map(({ icon: Icon, title, desc }) => (
                        <motion.article key={title} variants={fadeUp} className="pb-service-card">
                            <div className="pb-service-icon"><Icon size={24} /></div>
                            <h3>{title}</h3>
                            <p>{desc}</p>
                            <button type="button" className="pb-service-link" onClick={getStarted}>Get a quote <ArrowRight size={14} /></button>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   PROCESS
══════════════════════════════════════════════════════════════ */
function Process() {
    return (
        <section className="pb-process">
            <div className="pb-inner">
                <SectionHead eyebrow="How it works" title="Our Book" accent="Publishing Process" sub="Five clear steps from your first message to your book on the shelves." />
                <motion.ol variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="pb-process-row">
                    {processSteps.map(({ icon: Icon, title, desc }, i) => (
                        <motion.li key={title} variants={fadeUp} className="pb-process-step">
                            <div className="pb-process-top">
                                <span className="pb-process-num">{String(i + 1).padStart(2, "0")}</span>
                                <span className="pb-process-icon"><Icon size={20} /></span>
                            </div>
                            <h3>{title}</h3>
                            <p>{desc}</p>
                        </motion.li>
                    ))}
                </motion.ol>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   WHY BEXLEY + STATS
══════════════════════════════════════════════════════════════ */
function WhyUs() {
    return (
        <section className="pb-why">
            <div className="pb-inner pb-why-grid">
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
                    <motion.div variants={fadeUp}><Eyebrow>Why Bexley</Eyebrow></motion.div>
                    <motion.h2 variants={maskReveal} className="pb-h2 left">
                        Authors Rely On <span className="accent">Bexley Publishing For</span>
                    </motion.h2>
                    <motion.ul variants={staggerContainer} className="pb-why-list">
                        {whyPoints.map((p) => (
                            <motion.li key={p} variants={fadeUp}><span className="pb-why-check"><ShieldCheck size={15} /></span>{p}</motion.li>
                        ))}
                    </motion.ul>
                    <motion.div variants={fadeUp}><CtaButtons onDark={false} /></motion.div>
                </motion.div>

                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="pb-stats">
                    {stats.map(({ icon: Icon, num, label }, i) => (
                        <motion.div key={label} variants={fadeUp} className={`pb-stat ${i === 0 ? "feature" : ""}`}>
                            <Icon size={22} />
                            <b>{num}</b>
                            <span>{label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   TESTIMONIALS (Trustpilot style)
══════════════════════════════════════════════════════════════ */
function Testimonials() {
    const [perView, setPerView] = useState(3);
    const [index, setIndex] = useState(0);
    const pages = Math.max(1, testimonials.length - perView + 1);

    useEffect(() => {
        const calc = () => setPerView(window.innerWidth < 700 ? 1 : window.innerWidth < 1100 ? 2 : 3);
        calc();
        window.addEventListener("resize", calc);
        return () => window.removeEventListener("resize", calc);
    }, []);
    useEffect(() => { if (index > pages - 1) setIndex(0); }, [pages, index]);
    useEffect(() => {
        const t = setInterval(() => setIndex((i) => (i + 1) % pages), 5000);
        return () => clearInterval(t);
    }, [pages]);

    return (
        <section className="pb-testimonials">
            <div className="pb-inner">
                <SectionHead eyebrow="Testimonials" title="Reviews From" accent="Satisfied Authors" light />

                <motion.div className="pb-tp-summary" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <span className="pb-tp-label">{TRUST.label}</span>
                    <TrustStars rating={5} size={30} />
                    <span className="pb-tp-meta">Rated <strong>{TRUST.score}</strong> / 5 based on <strong>{TRUST.reviews} reviews</strong></span>
                    <span className="pb-tp-brand"><Star size={20} fill="#e8391d" stroke="#e8391d" /> Trustpilot</span>
                </motion.div>

                <div className="pb-slider">
                    <div className="pb-slider-track" style={{ transform: `translateX(-${(index * 100) / perView}%)` }}>
                        {testimonials.map(({ name, location, date, rating, title, quote }) => (
                            <div key={name} className="pb-slide" style={{ flex: `0 0 ${100 / perView}%` }}>
                                <article className="pb-tp-card">
                                    <header className="pb-tp-head">
                                        <span className="pb-tp-avatar" aria-hidden="true">{name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                                        <div>
                                            <p className="pb-tp-name">{name}</p>
                                            <p className="pb-tp-loc">{location} · 1 review</p>
                                        </div>
                                    </header>
                                    <div className="pb-tp-rowline">
                                        <TrustStars rating={rating} size={20} />
                                        <span className="pb-tp-verified"><BadgeCheck size={14} /> Verified</span>
                                    </div>
                                    <h3 className="pb-tp-title">{title}</h3>
                                    <p className="pb-tp-text">{quote}</p>
                                    <p className="pb-tp-date"><strong>Date of experience:</strong> {date}</p>
                                </article>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pb-dots">
                    {Array.from({ length: pages }).map((_, i) => (
                        <button key={i} type="button" aria-label={`Show reviews ${i + 1}`} className={`pb-dot ${i === index ? "active" : ""}`} onClick={() => setIndex(i)} />
                    ))}
                </div>

                <div className="pb-review-sites">
                    {reviewSites.map((s) => (
                        <div key={s} className="pb-review-site">
                            <LogoMark src={`/images/publishing/platforms/${slug(s)}.png`} name={s} />
                            <span className="pb-review-stars" aria-hidden="true">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="#e8391d" stroke="#e8391d" />)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════════ */
function Faq() {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <section className="pb-faq">
            <div className="pb-inner pb-faq-grid">
                <div className="pb-faq-intro">
                    <Eyebrow>FAQ</Eyebrow>
                    <motion.h2 variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pb-h2 left">
                        Questions Authors <span className="accent">Ask Us</span>
                    </motion.h2>
                    <p className="pb-sub left">Can't find your answer? Talk to a publishing consultant — it's free.</p>
                    <a href={BRAND.phoneHref} className="pb-faq-call"><span><Phone size={18} /></span><div><small>Call us now</small>{BRAND.phone}</div></a>
                </div>
                <div className="pb-faq-list">
                    {faqs.map(({ q, a }, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={q} className={`pb-faq-item ${isOpen ? "open" : ""}`}>
                                <button type="button" className="pb-faq-q" aria-expanded={isOpen} aria-controls={`pb-faq-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                                    <span>{q}</span>
                                    <span className="pb-faq-icon"><Plus size={18} /></span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={`pb-faq-${i}`} className="pb-faq-a"
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: smoothEase }}
                                        >
                                            <p>{a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   GET STARTED POPUP (web only)
══════════════════════════════════════════════════════════════ */
function GetStartedPopup() {
    const [open, setOpen] = useState(false);
    const { form, status, errorMsg, handle, submit } = useLeadForm("Book Publishing (Popup)");
    const loading = status === "loading";
    const firstInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onOpen = () => setOpen(true);
        window.addEventListener(POPUP_EVENT, onOpen);
        return () => window.removeEventListener(POPUP_EVENT, onOpen);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        const mq = window.matchMedia(`(min-width: ${POPUP_MIN_WIDTH}px)`);
        const onMq = () => { if (!mq.matches) setOpen(false); };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        mq.addEventListener("change", onMq);
        const t = setTimeout(() => firstInput.current?.focus(), 350);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKey);
            mq.removeEventListener("change", onMq);
            clearTimeout(t);
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div className="pb-pop-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={() => setOpen(false)}>
                    <motion.div
                        className="pb-pop" role="dialog" aria-modal="true" aria-labelledby="pb-pop-title"
                        initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }}
                        transition={{ duration: 0.5, ease: smoothEase }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="pb-pop-side" aria-hidden="true">
                            <span>Fill this form to avail special discounts of</span>
                            <strong>Up To 50%!</strong>
                        </div>
                        <div className="pb-pop-main">
                            <h2 id="pb-pop-title" className="pb-pop-h">
                                Looking For Professional Book Publishing Services
                                <span>At Affordable Rates?</span>
                            </h2>
                            <form className="pb-pop-form" onSubmit={submit}>
                                <input ref={firstInput} name="name" type="text" placeholder="Name" required aria-label="Name" value={form.name} onChange={handle} disabled={loading} />
                                <input name="email" type="email" placeholder="Enter your email here" required aria-label="Email" value={form.email} onChange={handle} disabled={loading} />
                                <input name="phone" type="tel" placeholder="Phone number" required aria-label="Phone number" value={form.phone} onChange={handle} disabled={loading} />
                                <textarea name="message" rows={4} placeholder="Talk about your project" aria-label="Talk about your project" value={form.message} onChange={handle} disabled={loading} />
                                <button type="submit" className="pb-pop-submit" disabled={loading}>
                                    {loading ? <><Loader2 size={16} className="pb-spin" /> Sending…</> : "Submit"}
                                </button>
                                {status === "error" && <FormError msg={errorMsg} />}
                            </form>
                        </div>
                        <div className="pb-pop-art">
                            <div className="pb-pop-panel">
                                <button type="button" className="pb-pop-close" aria-label="Close" onClick={() => setOpen(false)}><X size={20} /></button>
                            </div>
                            <PlainImg src={IMG.popup} alt="" className="pb-pop-img" fallback={<div className="pb-pop-img pb-pop-fallback"><BookCover src="" title="Your Book Here" author="You" tone={0} /></div>} />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
function Footer() {
    const { form, status, errorMsg, handle, submit } = useLeadForm("Book Publishing (Footer)");
    const loading = status === "loading";
    return (
        <footer className="pb-footer">
            <div className="pb-inner pb-footer-grid">
                <div className="pb-footer-brand">
                    <a href="#top" className="pb-logo" aria-label={`${BRAND.name}, back to top`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={IMG.footerLogo} alt={BRAND.name} className="pb-logo-img footer" />
                    </a>
                    <p>We have a proven record of turning thoughts, ideas and feelings into carefully written books. With our out-of-the-box thinking, we give authors' ideas life and help them leave their legacy in the literary world.</p>
                    <div className="pb-footer-contact">
                        <a href={BRAND.phoneHref}><Phone size={16} /><span><small>Call us</small>{BRAND.phone}</span></a>
                        <a href={`mailto:${BRAND.email}`}><Mail size={16} /><span><small>Discuss your ideas</small>{BRAND.email}</span></a>
                        <p><MapPin size={16} /><span><small>Address</small>{BRAND.headOffice}</span></p>
                    </div>
                </div>

                <div className="pb-footer-card">
                    <span className="pb-badge-50 corner">50%<small>off</small></span>
                    <p className="pb-footer-card-h">Ready To Become A Best-Seller?</p>
                    <p className="pb-footer-card-sub">Let's get started on your book.</p>
                    <form className="pb-footer-form" onSubmit={submit}>
                        <div className="pb-footer-row">
                            <input name="name" type="text" placeholder="Full name *" required aria-label="Full name" value={form.name} onChange={handle} disabled={loading} />
                            <input name="phone" type="tel" placeholder="Phone number *" required aria-label="Phone number" value={form.phone} onChange={handle} disabled={loading} />
                        </div>
                        <input name="email" type="email" placeholder="Email address *" required aria-label="Email address" value={form.email} onChange={handle} disabled={loading} />
                        <textarea name="message" rows={4} placeholder="Tell us about your project" aria-label="Tell us about your project" value={form.message} onChange={handle} disabled={loading} />
                        <button type="submit" className="pb-btn pb-btn-primary pb-btn-block" disabled={loading}>
                            {loading ? <><Loader2 size={16} className="pb-spin" /> Sending…</> : <>Get In Touch <Send size={15} /></>}
                        </button>
                        {status === "error" && <FormError msg={errorMsg} light />}
                    </form>
                </div>
            </div>
            <div className="pb-footer-bottom">
                <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
                <nav aria-label="Legal">{LEGAL_LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function PublishingLandingPage() {
    return (
        <>
            <style>{`
                /* ═══ TOKENS & GLOBAL ═══ */
                .pb-main {
                    --red: #e8391d; --red-dark: #c0271a; --ink: #05070f; --ink-2: #111522; --cream: #faf9f7;
                    --sun: #ffc83d; --grey: #6b7280; --line: #ece8e1;
                    width: 100%; overflow: hidden; font-family: var(--font-raleway), 'Raleway', Arial, sans-serif; color: var(--ink); background: var(--cream);
                }
                .pb-main *, .pb-main *::before, .pb-main *::after { box-sizing: border-box; }
                .pb-main a { text-decoration: none; color: inherit; }
                .pb-main :focus-visible { outline: 3px solid var(--sun); outline-offset: 3px; border-radius: 6px; }
                .pb-inner { max-width: 1240px; margin: 0 auto; padding: 0 64px; position: relative; z-index: 2; }

                /* ═══ EYEBROW / HEADINGS ═══ */
                .pb-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
                .pb-eyebrow.center { justify-content: center; }
                .pb-eyebrow-line { display: block; width: 32px; height: 2px; background: var(--red); flex-shrink: 0; }
                .pb-eyebrow-text { color: var(--red); font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.28em; }
                .pb-eyebrow.light .pb-eyebrow-text { color: var(--sun); }
                .pb-eyebrow.light .pb-eyebrow-line { background: var(--sun); }
                .pb-section-head { text-align: center; max-width: 820px; margin: 0 auto 56px; }
                .pb-h2 { font-weight: 900; text-transform: uppercase; line-height: 1.05; font-size: clamp(2rem, 3.5vw, 3rem); color: var(--ink); }
                .pb-h2.light { color: white; }
                .pb-h2.left { text-align: left; }
                .pb-h2 .accent { color: var(--red); }
                .pb-sub { color: var(--grey); font-size: 15px; line-height: 1.75; margin-top: 18px; }
                .pb-sub.light { color: rgba(255,255,255,0.6); }
                .pb-sub.left { text-align: left; }

                /* ═══ BUTTONS ═══ */
                .pb-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
                .pb-btn {
                    display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 2px solid transparent;
                    font-family: inherit; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;
                    padding: 15px 24px; border-radius: 12px; cursor: pointer; white-space: nowrap;
                    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, gap 0.2s ease, box-shadow 0.2s ease;
                }
                .pb-btn:hover { gap: 14px; }
                .pb-btn-primary { background: var(--red); color: white !important; }
                .pb-btn-primary:hover { background: var(--red-dark); box-shadow: 0 10px 40px rgba(232,57,29,0.4); }
                .pb-btn-light { background: white; color: var(--ink) !important; }
                .pb-btn-light:hover { background: var(--sun); }
                .pb-btn-dark { background: var(--ink); color: white !important; }
                .pb-btn-dark:hover { background: var(--red); }
                .pb-btn-ghost { background: transparent; color: white !important; border-color: rgba(255,255,255,0.45); }
                .pb-btn-ghost:hover { border-color: white; background: rgba(255,255,255,0.08); }
                .pb-btn-ghost-dark { background: transparent; color: var(--ink) !important; border-color: rgba(5,7,15,0.25); }
                .pb-btn-ghost-dark:hover { border-color: var(--ink); }
                .pb-btn-sm { padding: 11px 20px; font-size: 11px; }
                .pb-btn-block { width: 100%; }
                .pb-btn:disabled { opacity: 0.75; cursor: wait; }
                .pb-btn:disabled:hover { gap: 10px; box-shadow: none; }
                .pb-spin { animation: pb-spin 0.9s linear infinite; }
                @keyframes pb-spin { to { transform: rotate(360deg); } }

                .pb-form-err { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.5; font-weight: 600; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; padding: 10px 12px; border-radius: 10px; }
                .pb-form-err svg { flex-shrink: 0; margin-top: 2px; }
                .pb-form-err.light { color: #fca5a5; background: rgba(232,57,29,0.1); border-color: rgba(232,57,29,0.35); }

                /* ═══ BOOK COVERS (real or placeholder) ═══ */
                .pb-cover { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 4px 10px 10px 4px; box-shadow: 0 18px 40px rgba(0,0,0,0.35), inset 6px 0 10px -6px rgba(0,0,0,0.4); }
                .pb-faux { position: relative; display: flex; flex-direction: column; justify-content: flex-end; padding: 14% 12%; overflow: hidden; }
                .pb-faux::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 7%; background: rgba(0,0,0,0.18); }
                .pb-faux-bar { position: absolute; top: 12%; left: 12%; width: 34%; height: 4px; border-radius: 2px; }
                .pb-faux strong { font-weight: 900; text-transform: uppercase; line-height: 1; font-size: clamp(12px, 1.3vw, 18px); letter-spacing: 0.02em; overflow-wrap: anywhere; }
                .pb-genre-cover.pb-faux strong, .pb-shelf-book .pb-faux strong { font-size: 13px; }
                .pb-faux em { font-style: normal; font-size: 10px; font-weight: 600; opacity: 0.75; margin-top: 8px; letter-spacing: 0.08em; text-transform: uppercase; }

                /* ═══ HEADER ═══ */
                .pb-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 0; transition: background 0.3s ease, box-shadow 0.3s ease, padding 0.3s ease; }
                .pb-header.scrolled { background: rgba(5,7,15,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: 0 8px 30px rgba(0,0,0,0.25); padding: 12px 0; }
                .pb-header-inner { max-width: 1320px; margin: 0 auto; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
                .pb-logo { display: inline-flex; align-items: center; }
                .pb-logo-img { height: 52px; width: auto; display: block; object-fit: contain; transition: height 0.3s ease; }
                .pb-header.scrolled .pb-logo-img { height: 44px; }
                .pb-logo-img.footer { height: 64px; }
                .pb-header-right { display: flex; align-items: center; gap: 18px; }
                .pb-header-phone { display: inline-flex; align-items: center; gap: 10px; color: white !important; font-weight: 800; font-size: 15px; }
                .pb-header-phone-text { display: flex; flex-direction: column; line-height: 1.2; }
                .pb-header-phone-text small { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.5); }
                .pb-header-phone-icon { width: 38px; height: 38px; border-radius: 50%; background: rgba(232,57,29,0.15); color: var(--red); display: inline-flex; align-items: center; justify-content: center; transition: background 0.2s ease, color 0.2s ease; }
                .pb-header-phone:hover .pb-header-phone-icon { background: var(--red); color: white; }

                /* ═══ HERO ═══ */
                .pb-hero { position: relative; background: var(--ink); padding: 160px 0 0; overflow: hidden; }
                .pb-hero-glow { position: absolute; top: 38%; left: 50%; width: 1000px; height: 700px; transform: translate(-50%, -50%); border-radius: 50%; background: rgba(232,57,29,0.15); filter: blur(160px); pointer-events: none; }
                .pb-hero-dots { position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 30px 30px; pointer-events: none; }
                .pb-hero-inner { text-align: center; }
                .pb-hero-h1 { font-weight: 900; color: white; text-transform: uppercase; line-height: 0.98; font-size: clamp(2.6rem, 5vw, 4.6rem); max-width: 980px; margin: 0 auto 24px; }
                .pb-hero-h1 .accent { color: var(--red); }
                .pb-hero-sub { color: rgba(255,255,255,0.65); line-height: 1.85; max-width: 720px; margin: 0 auto 40px; font-size: clamp(0.95rem, 1.1vw, 1.05rem); }

                .pb-hero-form { position: relative; z-index: 5; display: grid; grid-template-columns: 200px 1fr 1fr; gap: 14px; max-width: 900px; margin: 0 auto; background: white; border-radius: 18px; padding: 14px; box-shadow: 0 40px 100px rgba(0,0,0,0.5); text-align: left; }
                .pb-hero-form-offer { position: relative; background: var(--ink-2); border-radius: 12px; padding: 22px 20px; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
                .pb-hero-form-offer::after { content: ""; position: absolute; right: -40px; bottom: -40px; width: 120px; height: 120px; border-radius: 50%; border: 18px solid rgba(232,57,29,0.25); }
                .pb-hero-form-offer p { color: white; font-weight: 900; font-size: 22px; line-height: 1.05; text-transform: uppercase; }
                .pb-badge-50 { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: var(--red); color: white; font-weight: 900; font-size: 20px; line-height: 1; margin-top: 14px; box-shadow: 0 0 0 5px rgba(232,57,29,0.25); position: relative; z-index: 1; }
                .pb-badge-50 small { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
                .pb-hero-form-fields, .pb-hero-form-msg { display: flex; flex-direction: column; gap: 10px; }
                .pb-hero-form-msg textarea { flex: 1; min-height: 96px; }
                .pb-hero-form-err { grid-column: 1 / -1; }
                .pb-hero-form input, .pb-hero-form textarea, .pb-footer-form input, .pb-footer-form textarea {
                    width: 100%; font-family: inherit; font-size: 14px; padding: 13px 14px; border-radius: 10px;
                    border: 1.5px solid #ececec; background: #f7f7f7; color: var(--ink); resize: vertical; transition: border-color 0.2s ease, background 0.2s ease;
                }
                .pb-hero-form input:focus, .pb-hero-form textarea:focus { outline: none; border-color: var(--red); background: white; }
                .pb-hero-form input:disabled, .pb-hero-form textarea:disabled, .pb-footer-form input:disabled, .pb-footer-form textarea:disabled { opacity: 0.6; cursor: not-allowed; }

                .pb-shelf { position: relative; z-index: 3; display: flex; align-items: flex-end; justify-content: center; gap: 18px; height: 280px; margin-top: 56px; padding: 0 20px; }
                .pb-shelf::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 60px; background: linear-gradient(to top, var(--ink), transparent); pointer-events: none; }
                .pb-shelf-book { flex: 0 0 auto; width: 150px; height: 220px; }
                .pb-shelf-book.b1 { width: 160px; height: 240px; transform-origin: bottom; margin-bottom: 40px; }
                .pb-shelf-book.b2 { height: 200px; }
                .pb-shelf-book.b3 { width: 130px; height: 170px; }
                .pb-shelf-book.b4 { width: 180px; height: 260px; }
                .pb-shelf-book.b5 { width: 130px; height: 175px; }
                .pb-shelf-book.b6 { height: 205px; }
                .pb-shelf-book.b7 { width: 160px; height: 240px; margin-bottom: 40px; }

                /* ═══ LOGO MARQUEE ═══ */
                .pb-marquee { background: white; border-bottom: 1px solid var(--line); overflow: hidden; padding: 26px 0; }
                .pb-marquee.dark { background: var(--ink-2); border: none; }
                .pb-marquee-track { display: flex; width: max-content; animation: pb-marquee 36s linear infinite; }
                .pb-marquee:hover .pb-marquee-track { animation-play-state: paused; }
                .pb-marquee-item { display: flex; align-items: center; justify-content: center; padding: 0 44px; height: 40px; border-right: 1px solid var(--line); }
                .pb-marquee.dark .pb-marquee-item { border-color: rgba(255,255,255,0.1); }
                .pb-logo-mark { height: 34px; width: auto; max-width: 160px; object-fit: contain; filter: grayscale(1); opacity: 0.75; transition: filter 0.3s ease, opacity 0.3s ease; }
                .pb-marquee-item:hover .pb-logo-mark { filter: none; opacity: 1; }
                .pb-wordmark { font-weight: 900; font-size: 20px; letter-spacing: -0.01em; color: #2b2f3a; white-space: nowrap; }
                .pb-marquee.dark .pb-wordmark { color: rgba(255,255,255,0.8); }
                .pb-marquee.dark .pb-logo-mark { filter: grayscale(1) brightness(3); }
                @keyframes pb-marquee { to { transform: translateX(-50%); } }

                /* ═══ GENRES ═══ */
                .pb-genres { padding: 120px 0; background: var(--cream); }
                .pb-genre-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
                .pb-genre-card { background: white; border: 1px solid var(--line); border-radius: 20px; padding: 32px 28px 30px; text-align: center; transition: border-color 0.3s ease, box-shadow 0.4s ease, transform 0.4s ease; }
                .pb-genre-card:hover { border-color: rgba(232,57,29,0.35); box-shadow: 0 22px 50px rgba(0,0,0,0.1); transform: translateY(-4px); }
                .pb-genre-art { position: relative; height: 210px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
                .pb-genre-ring { position: absolute; width: 190px; height: 190px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255,200,61,0.35), rgba(232,57,29,0.12)); border: 2px dashed rgba(232,57,29,0.3); transition: transform 0.8s ease; }
                .pb-genre-card:hover .pb-genre-ring { transform: rotate(40deg) scale(1.05); }
                .pb-genre-cover { position: relative; width: 130px !important; height: 190px !important; transform: rotate(-4deg); transition: transform 0.5s ease; }
                .pb-genre-card:hover .pb-genre-cover { transform: rotate(0deg) translateY(-6px); }
                .pb-genre-title { font-weight: 900; font-size: 17px; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 14px; }
                .pb-genre-list { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
                .pb-genre-list li { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 600; color: #4b5563; background: var(--cream); border: 1px solid var(--line); padding: 6px 11px; border-radius: 999px; }
                .pb-genre-list li svg { color: var(--red); }

                /* ═══ CTA BAND ═══ */
                .pb-band { position: relative; background: linear-gradient(120deg, #05070f 0%, #1a0f14 45%, #8f1c0c 100%); overflow: hidden; }
                .pb-band-bg { position: absolute; inset: 0; opacity: 0.06; background-image: radial-gradient(#fff 1.5px, transparent 1.5px); background-size: 26px 26px; }
                .pb-band-inner { display: grid; grid-template-columns: 1.25fr 1fr; gap: 48px; align-items: center; min-height: 440px; }
                .pb-band-copy { padding: 80px 0; }
                .pb-band-eyebrow { color: var(--sun); font-weight: 900; font-size: 14px; margin-bottom: 10px; }
                .pb-band-h2 { color: white; font-weight: 900; text-transform: uppercase; line-height: 1.05; font-size: clamp(2rem, 3.2vw, 2.9rem); margin-bottom: 18px; }
                .pb-band-h2 .accent { color: var(--red); }
                .pb-band-text { color: rgba(255,255,255,0.65); font-size: 15px; line-height: 1.8; max-width: 560px; margin-bottom: 32px; }
                .pb-band-art { position: relative; align-self: stretch; display: flex; align-items: center; justify-content: center; }
                .pb-band-img { max-width: 100%; max-height: 420px; object-fit: contain; filter: drop-shadow(0 30px 40px rgba(0,0,0,0.5)); }
                .pb-band-stack { position: relative; width: 340px; height: 320px; }
                .pb-band-stack .pb-cover { position: absolute; width: 170px; height: 250px; }
                .pb-band-stack .s1 { left: 0; top: 40px; transform: rotate(-8deg); }
                .pb-band-stack .s2 { left: 90px; top: 0; z-index: 2; }
                .pb-band-stack .s3 { left: 170px; top: 50px; transform: rotate(8deg); }
                .pb-band-chip { position: absolute; left: 4%; bottom: 14%; z-index: 3; display: flex; align-items: center; gap: 10px; background: white; border-radius: 14px; padding: 12px 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.35); }
                .pb-band-chip b { color: var(--red); font-weight: 900; font-size: 30px; line-height: 1; }
                .pb-band-chip span { font-size: 11px; font-weight: 700; line-height: 1.3; color: var(--ink); }

                /* ═══ AWARDS ═══ */
                .pb-awards { background: white; border-bottom: 1px solid var(--line); }
                .pb-awards-inner { display: flex; align-items: center; justify-content: space-between; gap: 32px; padding-top: 30px; padding-bottom: 30px; }
                .pb-awards-label { display: flex; align-items: center; gap: 12px; font-weight: 900; text-transform: uppercase; font-size: 16px; line-height: 1.25; max-width: 280px; }
                .pb-awards-label svg { color: var(--red); flex-shrink: 0; }
                .pb-awards-row { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; justify-content: flex-end; }
                .pb-award img { width: 66px; height: 66px; object-fit: contain; }
                .pb-award-fallback { width: 66px; height: 66px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #b8860b; background: radial-gradient(circle at 35% 30%, #fff3c4, #f0c54a 60%, #c99624); box-shadow: inset 0 0 0 4px rgba(255,255,255,0.5), 0 6px 14px rgba(0,0,0,0.12); }

                /* ═══ PORTFOLIO ═══ */
                .pb-portfolio { padding: 120px 0; background: var(--cream); }
                .pb-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-bottom: 44px; }
                .pb-tab { position: relative; background: none; border: none; font-family: inherit; font-weight: 700; font-size: 13px; color: var(--ink); padding: 10px 16px; border-radius: 999px; cursor: pointer; z-index: 0; transition: color 0.25s ease; }
                .pb-tab:hover { color: var(--red); }
                .pb-tab.active { color: white; }
                .pb-tab-pill { position: absolute; inset: 0; background: var(--red); border-radius: 999px; z-index: -1; }
                .pb-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px 56px; max-width: 820px; margin: 0 auto; }
                .pb-gallery-item { aspect-ratio: 2/3; transition: transform 0.5s ease; }
                .pb-gallery-item:hover { transform: translateY(-8px) rotate(-1deg); }

                /* ═══ SERVICES ═══ */
                .pb-services { padding: 120px 0; background: white; }
                .pb-service-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
                .pb-service-card { display: flex; flex-direction: column; background: var(--cream); border: 1px solid var(--line); border-radius: 18px; padding: 28px 24px; transition: background 0.35s ease, border-color 0.35s ease, transform 0.35s ease; }
                .pb-service-card:hover { background: var(--ink); border-color: var(--ink); transform: translateY(-4px); }
                .pb-service-icon { width: 50px; height: 50px; border-radius: 14px; background: rgba(232,57,29,0.1); color: var(--red); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; transition: background 0.35s ease, color 0.35s ease; }
                .pb-service-card:hover .pb-service-icon { background: var(--red); color: white; }
                .pb-service-card h3 { font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; transition: color 0.35s ease; }
                .pb-service-card p { color: var(--grey); font-size: 13.5px; line-height: 1.7; flex: 1; transition: color 0.35s ease; }
                .pb-service-card:hover h3 { color: white; }
                .pb-service-card:hover p { color: rgba(255,255,255,0.6); }
                .pb-service-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; margin-top: 18px; background: none; border: none; padding: 0; cursor: pointer; font-family: inherit; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--red); transition: gap 0.2s ease; }
                .pb-service-link:hover { gap: 10px; }

                /* ═══ PROCESS ═══ */
                .pb-process { padding: 120px 0; background: var(--cream); }
                .pb-process-row { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; position: relative; }
                .pb-process-row::before { content: ""; position: absolute; top: 34px; left: 6%; right: 6%; border-top: 2px dashed rgba(232,57,29,0.35); }
                .pb-process-step { position: relative; background: white; border: 1px solid var(--line); border-radius: 18px; padding: 24px 22px; transition: border-color 0.3s ease, box-shadow 0.4s ease; }
                .pb-process-step:hover { border-color: rgba(232,57,29,0.4); box-shadow: 0 18px 40px rgba(0,0,0,0.08); }
                .pb-process-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
                .pb-process-num { font-weight: 900; font-size: 34px; line-height: 1; color: var(--red); }
                .pb-process-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--ink); color: white; display: flex; align-items: center; justify-content: center; }
                .pb-process-step h3 { font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 10px; line-height: 1.25; }
                .pb-process-step p { color: var(--grey); font-size: 13px; line-height: 1.7; }

                /* ═══ WHY + STATS ═══ */
                .pb-why { padding: 120px 0; background: white; }
                .pb-why-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 72px; align-items: center; }
                .pb-why-list { list-style: none; padding: 0; margin: 32px 0 36px; display: flex; flex-direction: column; gap: 16px; }
                .pb-why-list li { display: flex; align-items: flex-start; gap: 14px; color: #4b5563; font-size: 15px; line-height: 1.6; }
                .pb-why-check { width: 28px; height: 28px; border-radius: 50%; background: rgba(232,57,29,0.1); color: var(--red); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .pb-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
                .pb-stat { background: var(--cream); border: 1px solid var(--line); border-radius: 20px; padding: 30px 26px; display: flex; flex-direction: column; gap: 6px; }
                .pb-stat svg { color: var(--red); margin-bottom: 10px; }
                .pb-stat b { font-weight: 900; font-size: 46px; line-height: 1; }
                .pb-stat span { color: var(--grey); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
                .pb-stat.feature { background: var(--red); border-color: var(--red); }
                .pb-stat.feature svg, .pb-stat.feature b { color: white; }
                .pb-stat.feature span { color: rgba(255,255,255,0.8); }

                /* ═══ TESTIMONIALS ═══ */
                .pb-testimonials { padding: 120px 0; background: #111; }
                .pb-tp-stars { display: inline-flex; gap: 3px; }
                .pb-tp-star { display: inline-flex; align-items: center; justify-content: center; background: #dcdce6; border-radius: 2px; }
                .pb-tp-star.on { background: var(--red); }
                .pb-tp-summary { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px 20px; margin: -16px auto 48px; padding: 18px 28px; max-width: 860px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; }
                .pb-tp-label { color: white; font-weight: 900; font-size: 22px; }
                .pb-tp-meta { color: rgba(255,255,255,0.65); font-size: 14px; }
                .pb-tp-meta strong { color: white; }
                .pb-tp-brand { display: inline-flex; align-items: center; gap: 6px; color: white; font-weight: 800; font-size: 18px; }
                .pb-slider { overflow: hidden; margin: 0 -12px; }
                .pb-slider-track { display: flex; transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
                .pb-slide { padding: 0 12px; }
                .pb-tp-card { height: 100%; display: flex; flex-direction: column; background: white; border-radius: 10px; padding: 26px; border: 1px solid #e5e5ec; transition: box-shadow 0.35s ease, transform 0.35s ease; }
                .pb-tp-card:hover { box-shadow: 0 18px 40px rgba(0,0,0,0.35); transform: translateY(-3px); }
                .pb-tp-head { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #efeff4; }
                .pb-tp-avatar { width: 42px; height: 42px; border-radius: 50%; background: rgba(232,57,29,0.12); color: var(--red); font-weight: 900; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .pb-tp-name { font-weight: 800; font-size: 15px; color: #191919; }
                .pb-tp-loc { font-size: 12px; color: #6c6c85; margin-top: 2px; }
                .pb-tp-rowline { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
                .pb-tp-verified { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #6c6c85; }
                .pb-tp-verified svg { color: var(--red); }
                .pb-tp-title { font-weight: 800; font-size: 16px; color: #191919; margin-bottom: 8px; line-height: 1.35; }
                .pb-tp-text { color: #3f3f55; font-size: 14.5px; line-height: 1.7; flex: 1; }
                .pb-tp-date { font-size: 12px; color: #6c6c85; margin-top: 18px; padding-top: 14px; border-top: 1px solid #efeff4; }
                .pb-tp-date strong { color: #191919; font-weight: 700; }
                .pb-dots { display: flex; justify-content: center; gap: 10px; margin-top: 40px; }
                .pb-dot { width: 10px; height: 10px; border-radius: 999px; border: none; background: rgba(255,255,255,0.25); cursor: pointer; transition: width 0.35s ease, background 0.35s ease; padding: 0; }
                .pb-dot.active { width: 30px; background: var(--red); }
                .pb-review-sites { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin-top: 56px; }
                .pb-review-site { display: flex; flex-direction: column; align-items: center; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px 24px; min-width: 150px; }
                .pb-review-site .pb-wordmark { color: white; font-size: 18px; }
                .pb-review-site .pb-logo-mark { height: 28px; filter: grayscale(1) brightness(3); }
                .pb-review-stars { display: flex; gap: 2px; }

                /* ═══ FAQ ═══ */
                .pb-faq { padding: 120px 0; background: var(--cream); }
                .pb-faq-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 72px; align-items: start; }
                .pb-faq-intro { position: sticky; top: 120px; }
                .pb-faq-call { display: inline-flex; align-items: center; gap: 14px; margin-top: 32px; background: var(--ink); color: white !important; padding: 14px 22px 14px 14px; border-radius: 16px; transition: background 0.2s ease; }
                .pb-faq-call:hover { background: var(--red); }
                .pb-faq-call > span { width: 44px; height: 44px; border-radius: 12px; background: var(--red); display: flex; align-items: center; justify-content: center; }
                .pb-faq-call:hover > span { background: var(--ink); }
                .pb-faq-call div { display: flex; flex-direction: column; font-weight: 900; font-size: 17px; }
                .pb-faq-call small { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; opacity: 0.6; }
                .pb-faq-list { display: flex; flex-direction: column; gap: 12px; }
                .pb-faq-item { background: white; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; transition: border-color 0.3s ease; }
                .pb-faq-item.open { border-color: rgba(232,57,29,0.4); }
                .pb-faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; text-align: left; background: none; border: none; padding: 20px 22px; cursor: pointer; font-family: inherit; font-weight: 800; font-size: 15.5px; color: var(--ink); }
                .pb-faq-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--cream); color: var(--red); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.35s ease, background 0.3s ease, color 0.3s ease; }
                .pb-faq-item.open .pb-faq-icon { transform: rotate(45deg); background: var(--red); color: white; }
                .pb-faq-a { overflow: hidden; }
                .pb-faq-a p { padding: 0 22px 22px; color: var(--grey); font-size: 14.5px; line-height: 1.75; }

                /* ═══ FOOTER ═══ */
                .pb-footer { background: var(--ink); color: rgba(255,255,255,0.6); border-top: 4px solid var(--red); position: relative; overflow: hidden; }
                .pb-footer::before { content: ""; position: absolute; right: -200px; top: -200px; width: 600px; height: 600px; border-radius: 50%; background: rgba(232,57,29,0.12); filter: blur(120px); }
                .pb-footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; padding-top: 88px; padding-bottom: 64px; }
                .pb-footer-brand > p { margin-top: 22px; font-size: 14px; line-height: 1.8; max-width: 440px; }
                .pb-footer-contact { display: flex; flex-direction: column; gap: 16px; margin-top: 32px; }
                .pb-footer-contact a, .pb-footer-contact p { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: white; font-weight: 700; }
                .pb-footer-contact svg { color: var(--red); flex-shrink: 0; margin-top: 12px; }
                .pb-footer-contact span { display: flex; flex-direction: column; }
                .pb-footer-contact small { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.45); margin-bottom: 2px; }
                .pb-footer-contact a:hover { color: var(--red); }
                .pb-footer-card { position: relative; background: rgba(255,255,255,0.04); border: 2px solid var(--red); border-radius: 22px; padding: 40px 34px 34px; }
                .pb-badge-50.corner { position: absolute; top: -26px; right: 26px; margin: 0; }
                .pb-footer-card-h { color: white; font-weight: 900; font-size: 24px; text-transform: uppercase; line-height: 1.1; }
                .pb-footer-card-sub { margin: 6px 0 22px; font-size: 14px; }
                .pb-footer-form { display: flex; flex-direction: column; gap: 12px; }
                .pb-footer-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .pb-footer-form input, .pb-footer-form textarea { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: white; }
                .pb-footer-form input::placeholder, .pb-footer-form textarea::placeholder { color: rgba(255,255,255,0.4); }
                .pb-footer-form input:focus, .pb-footer-form textarea:focus { outline: none; border-color: var(--red); }
                .pb-footer-bottom { position: relative; z-index: 2; max-width: 1240px; margin: 0 auto; padding: 24px 64px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13px; }
                .pb-footer-bottom nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; }
                .pb-footer-bottom a:hover { color: var(--red); }

                /* ═══ POPUP (web only) ═══ */
                .pb-pop-backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 40px; background: rgba(5,7,15,0.35); backdrop-filter: blur(12px) saturate(1.1); -webkit-backdrop-filter: blur(12px) saturate(1.1); }
                .pb-pop { position: relative; display: grid; grid-template-columns: auto 330px 380px; align-items: end; max-height: calc(100vh - 80px); }
                .pb-pop-side { writing-mode: vertical-rl; transform: rotate(180deg); display: flex; flex-direction: column; gap: 4px; align-self: end; margin-right: 14px; padding-bottom: 4px; }
                .pb-pop-side span { color: white; font-size: 15px; font-weight: 500; text-shadow: 0 2px 16px rgba(0,0,0,0.6); }
                .pb-pop-side strong { color: white; font-size: 34px; font-weight: 900; line-height: 1; text-shadow: 0 4px 24px rgba(0,0,0,0.65); }
                .pb-pop-main { position: relative; z-index: 2; }
                .pb-pop-h { position: relative; color: white; font-weight: 900; font-size: 23px; line-height: 1.15; margin-bottom: 16px; width: 360px; text-shadow: 0 2px 18px rgba(0,0,0,0.6); }
                .pb-pop-h::before { content: ""; position: absolute; inset: -18px -24px -14px -24px; background: rgba(5,7,15,0.35); filter: blur(22px); border-radius: 40px; z-index: -1; }
                .pb-pop-h span { display: block; font-weight: 400; font-size: 21px; margin-top: 6px; }
                .pb-pop-form { background: var(--red); border-radius: 6px; padding: 24px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 30px 70px rgba(0,0,0,0.4); }
                .pb-pop-form input, .pb-pop-form textarea { width: 100%; font-family: inherit; font-size: 13px; padding: 12px 10px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.08); background: white; color: var(--ink); resize: vertical; }
                .pb-pop-form input:focus, .pb-pop-form textarea:focus { outline: 3px solid var(--sun); outline-offset: 0; }
                .pb-pop-form input:disabled, .pb-pop-form textarea:disabled { opacity: 0.65; }
                .pb-pop-submit { margin-top: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--ink); color: white; border: none; border-radius: 4px; padding: 14px; cursor: pointer; font-family: inherit; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; transition: background 0.2s ease, color 0.2s ease; }
                .pb-pop-submit:hover:not(:disabled) { background: white; color: var(--red); }
                .pb-pop-submit:disabled { opacity: 0.75; cursor: wait; }
                .pb-pop-art { position: relative; height: 460px; margin-left: -60px; align-self: center; z-index: 1; }
                .pb-pop-panel { position: absolute; top: -40px; right: 0; width: 290px; height: 400px; border-radius: 4px; background: var(--ink); border: 1px solid rgba(232,57,29,0.35); background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 18px 18px; box-shadow: 0 30px 70px rgba(0,0,0,0.35); }
                .pb-pop-close { position: absolute; top: 6px; right: 6px; width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer; background: transparent; color: white; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease; }
                .pb-pop-close:hover { background: var(--red); }
                .pb-pop-img { position: absolute; left: 0; bottom: 0; width: 100%; height: 100%; object-fit: contain; object-position: bottom center; z-index: 2; filter: drop-shadow(0 20px 30px rgba(0,0,0,0.35)); }
                .pb-pop-fallback { display: flex; align-items: flex-end; justify-content: center; padding-bottom: 20px; }
                .pb-pop-fallback .pb-cover { width: 220px; height: 330px; transform: rotate(-4deg); }
                @media (max-height: 640px) {
                    .pb-pop-art { height: 380px; }
                    .pb-pop-panel { height: 330px; }
                    .pb-pop-form textarea { min-height: 60px; height: 60px; }
                }
                @media (max-width: 1023px) { .pb-pop-backdrop { display: none; } }

                /* ══════════════════════════════════════════
                   1800px+ — Full HD / 4K
                ══════════════════════════════════════════ */
                @media (min-width: 1800px) {
                    .pb-inner { max-width: 1640px; padding: 0 120px; }
                    .pb-header-inner { max-width: 1760px; }
                    .pb-footer-bottom { max-width: 1640px; padding-left: 120px; padding-right: 120px; }
                    .pb-hero { padding-top: 200px; }
                    .pb-hero-h1 { font-size: clamp(4.4rem, 4.4vw, 6.6rem); max-width: 1300px; }
                    .pb-hero-sub { font-size: 1.2rem; max-width: 900px; }
                    .pb-hero-form { max-width: 1100px; }
                    .pb-shelf { height: 340px; gap: 26px; }
                    .pb-shelf-book { zoom: 1.2; }
                    .pb-genres, .pb-portfolio, .pb-services, .pb-process, .pb-why, .pb-testimonials, .pb-faq { padding: 160px 0; }
                    .pb-h2 { font-size: clamp(3rem, 3.2vw, 4.4rem); }
                    .pb-sub, .pb-band-text, .pb-why-list li, .pb-tp-text, .pb-faq-a p { font-size: 17px; }
                    .pb-btn { font-size: 13px; padding: 18px 30px; }
                    .pb-gallery { max-width: 1100px; }
                    .pb-pop { grid-template-columns: auto 400px 460px; }
                    .pb-pop-h { width: 440px; font-size: 28px; }
                    .pb-pop-art { height: 560px; }
                    .pb-pop-panel { width: 350px; height: 490px; }
                }

                /* ══════════════════════════════════════════
                   ≤1200px — Laptop
                ══════════════════════════════════════════ */
                @media (max-width: 1200px) {
                    .pb-shelf-book.b1, .pb-shelf-book.b7 { display: none; }
                    .pb-service-grid { grid-template-columns: repeat(2, 1fr); }
                    .pb-process-row { grid-template-columns: repeat(3, 1fr); }
                    .pb-process-row::before { display: none; }
                    .pb-awards-inner { flex-direction: column; text-align: center; }
                    .pb-awards-label { max-width: none; }
                    .pb-awards-row { justify-content: center; }
                }

                /* ══════════════════════════════════════════
                   ≤1024px — Small Laptop / Tablet landscape
                ══════════════════════════════════════════ */
                @media (max-width: 1024px) {
                    .pb-inner { padding: 0 40px; }
                    .pb-footer-bottom { padding: 24px 40px; }
                    .pb-hero-form { grid-template-columns: 1fr 1fr; }
                    .pb-hero-form-offer { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; }
                    .pb-hero-form-offer p br { display: none; }
                    .pb-badge-50 { margin-top: 0; }
                    .pb-genre-grid { grid-template-columns: repeat(2, 1fr); }
                    .pb-band-inner { grid-template-columns: 1fr; text-align: center; }
                    .pb-band-copy { padding: 72px 0 0; }
                    .pb-band-text { margin-left: auto; margin-right: auto; }
                    .pb-band-copy .pb-actions { justify-content: center; }
                    .pb-band-art { padding-bottom: 56px; }
                    .pb-why-grid, .pb-faq-grid, .pb-footer-grid { grid-template-columns: 1fr; gap: 48px; }
                    .pb-faq-intro { position: static; }
                }

                /* ══════════════════════════════════════════
                   ≤900px — Tablet
                ══════════════════════════════════════════ */
                @media (max-width: 900px) {
                    .pb-hero { padding-top: 140px; }
                    .pb-shelf { height: 220px; gap: 12px; margin-top: 44px; }
                    .pb-shelf-book { width: 110px !important; height: 160px !important; }
                    .pb-shelf-book.b4 { width: 130px !important; height: 190px !important; }
                    .pb-shelf-book.b3, .pb-shelf-book.b5 { display: none; }
                    .pb-genres, .pb-portfolio, .pb-services, .pb-process, .pb-why, .pb-testimonials, .pb-faq { padding: 88px 0; }
                    .pb-gallery { gap: 28px 32px; }
                    .pb-process-row { grid-template-columns: repeat(2, 1fr); }
                    .pb-marquee-item { padding: 0 30px; }
                }

                /* ══════════════════════════════════════════
                   ≤640px — Mobile
                ══════════════════════════════════════════ */
                @media (max-width: 640px) {
                    .pb-inner, .pb-header-inner { padding: 0 20px; }
                    .pb-header-phone-text { display: none; }
                    .pb-header-right { gap: 10px; }
                    .pb-logo-img { height: 42px; }
                    .pb-hero { padding-top: 120px; }
                    .pb-hero-h1 { font-size: clamp(2rem, 9vw, 2.7rem); }
                    .pb-hero-sub { font-size: 0.9rem; margin-bottom: 30px; }
                    .pb-hero-form { grid-template-columns: 1fr; padding: 12px; }
                    .pb-hero-form-offer p { font-size: 18px; }
                    .pb-shelf { height: 170px; gap: 10px; }
                    .pb-shelf-book { width: 88px !important; height: 130px !important; }
                    .pb-shelf-book.b4 { width: 104px !important; height: 150px !important; }
                    .pb-h2 { font-size: clamp(1.6rem, 7vw, 2.2rem); }
                    .pb-section-head { margin-bottom: 36px; }
                    .pb-genres, .pb-portfolio, .pb-services, .pb-process, .pb-why, .pb-testimonials, .pb-faq { padding: 64px 0; }
                    .pb-genre-grid, .pb-service-grid, .pb-process-row { grid-template-columns: 1fr; }
                    .pb-actions { flex-direction: column; align-items: stretch; width: 100%; }
                    .pb-actions .pb-btn { width: 100%; }
                    .pb-band-stack { transform: scale(0.8); }
                    .pb-tabs { flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start; margin: 0 -20px 32px; padding: 0 20px 6px; scrollbar-width: none; }
                    .pb-tabs::-webkit-scrollbar { display: none; }
                    .pb-tab { white-space: nowrap; flex-shrink: 0; }
                    .pb-gallery { grid-template-columns: repeat(2, 1fr); gap: 20px; }
                    .pb-award img, .pb-award-fallback { width: 52px; height: 52px; }
                    .pb-stat { padding: 22px 18px; }
                    .pb-stat b { font-size: 34px; }
                    .pb-tp-card { padding: 20px; }
                    .pb-tp-summary { padding: 16px; margin-bottom: 32px; }
                    .pb-review-site { min-width: 0; flex: 1 1 40%; padding: 14px; }
                    .pb-faq-q { padding: 16px 18px; font-size: 14.5px; }
                    .pb-faq-a p { padding: 0 18px 18px; }
                    .pb-footer-grid { padding-top: 64px; }
                    .pb-footer-card { padding: 36px 20px 24px; }
                    .pb-footer-row { grid-template-columns: 1fr; }
                    .pb-footer-bottom { padding: 20px; flex-direction: column; text-align: center; align-items: center; }
                }

                @media (max-width: 380px) {
                    .pb-inner, .pb-header-inner { padding: 0 14px; }
                    .pb-hero-h1 { font-size: 1.75rem; }
                    .pb-h2 { font-size: 1.45rem; }
                    .pb-logo-img { height: 36px; }
                    .pb-gallery { gap: 14px; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .pb-marquee-track { animation: none; }
                    .pb-main *, .pb-main *::before, .pb-main *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
                }
            `}</style>

            <main id="top" className="pb-main">
                <Header />
                <Hero />
                <Marquee items={retailers} label="Platforms we publish on" />
                <Genres />
                <CtaBand
                    eyebrow="Share your legacy with"
                    title={<>Proficient Self Book <span className="accent">Publishing Services!</span></>}
                    text="We offer editing, design, marketing and distribution to help you create a beautiful, high-quality book — and get it into readers' hands."
                    image={IMG.cta1}
                    badge
                />
                <AwardsStrip />
                <Portfolio />
                <Services />
                <CtaBand
                    eyebrow="Your story deserves readers"
                    title={<>Start Your Publishing <span className="accent">Journey Today!</span></>}
                    text="Get complete publishing services under one roof. Our distribution network and marketing expertise put your book in the hands of readers worldwide."
                    image={IMG.cta2}
                />
                <Marquee items={[...retailers].reverse()} dark label="Distribution partners" />
                <Process />
                <WhyUs />
                <Testimonials />
                <Faq />
                <Footer />
                <GetStartedPopup />
            </main>
        </>
    );
}
