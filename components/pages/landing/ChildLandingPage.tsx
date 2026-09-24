"use client";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useInView, Variants } from "framer-motion";
import {
    ArrowRight, MessageCircle, Phone, Mail, MapPin, Send, Star, X, Loader2, BadgeCheck, AlertCircle,
    ShieldCheck, Users, Wallet, Timer, RefreshCw, Lightbulb, Clock, LayoutGrid, Award, ImageIcon, Sparkles,
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

const IMG = {
    headerLogo: "/images/page/Bexley-Publishing-03.png",
    footerLogo: "/images/page/Bexley-Publishing-03.png",
    heroLeft: "/images/page/child-banner-vec-img3.png",
    heroRight: "/images/page/child-banner-vec-img4.png",
    agency: "/images/page/e-bok-inner-img.png",
    cta1: "/images/page/child-cta-img2.png",
    cta2: "/images/page/child-cta-img.png",
    process: "/images/page/process-img-m.png",
    finalLeft: "/images/page/cta-vec-img2.png",
    finalRight: "/images/page/cta-vec-img1.png",
    popup: "/images/page/popup-new-side-img.png", // ← replace with your popup character image
};

/* ══════════════════════════════════════════════════════════════
   LEAD FORM SUBMISSION (CRM)
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

/* Shared by the hero form and the footer form */
function useLeadForm(defaultService = "Children's Book Illustration") {
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

        /* The API has no service field, so the selected service
           is added to the top of the message instead. */
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

/* Landing page: the only outbound links are these legal pages (footer) + /thank-you after submit */
const LEGAL_LINKS = [
    { label: "Terms & Conditions", href: "/terms-of-use" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
];

/* Popup opens only on desktop/web; below this width "Get Started" scrolls to the hero form */
const POPUP_MIN_WIDTH = 1024;
const POPUP_EVENT = "cb:open-popup";

/* ══════════════════════════════════════════════════════════════
   ANIMATION (same curves as the About page)
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
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

/* ══════════════════════════════════════════════════════════════
   LIVE CHAT (same as About page)
══════════════════════════════════════════════════════════════ */
function openLiveChat() {
    if (typeof window === "undefined") return;
    const w = window as any;
    if (w.LiveChatWidget) { w.LiveChatWidget.call("maximize"); return; }
    const lc = w.LC_API;
    if (lc && typeof lc.open_chat_window === "function") { lc.open_chat_window(); return; }
    const selectors = ["#chat-widget-container button", "[id^='chat-widget']", "iframe[title*='chat' i]"];
    for (const sel of selectors) {
        const el = document.querySelector<HTMLElement>(sel);
        if (el) { el.click(); return; }
    }
}

function scrollToForm() {
    document.getElementById("cb-hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* "Get Started": popup on web, scroll to hero form on mobile/tablet */
function getStarted() {
    if (typeof window === "undefined") return;
    if (window.matchMedia(`(min-width: ${POPUP_MIN_WIDTH}px)`).matches) {
        window.dispatchEvent(new Event(POPUP_EVENT));
    } else {
        scrollToForm();
    }
}

/* ══════════════════════════════════════════════════════════════
   IMAGE WITH FALLBACK — shows a soft placeholder until you add files
══════════════════════════════════════════════════════════════ */
function Img({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    if (failed) {
        return (
            <div className={`cb-ph ${className}`} role="img" aria-label={alt}>
                <ImageIcon size={28} />
                <span>{alt}</span>
            </div>
        );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const agencyFeatures = [
    { icon: ShieldCheck, title: "100% Ownership" },
    { icon: Users, title: "Audience-Oriented Illustrations" },
    { icon: Wallet, title: "Affordable Rates" },
    { icon: Timer, title: "4–7 Days Project Completion" },
];

const categories = ["Children", "Comic", "Book Illustration", "Animals", "Fantasy", "Portrait", "Psychedelic", "Retro"];
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
// Put files at /public/images/children/portfolio/<category>-<n>.webp  e.g. children-1.webp
const portfolio: Record<string, string[]> = Object.fromEntries(
    categories.map((c) => [c, Array.from({ length: c === "Children" ? 12 : 8 }, (_, i) => `/images/children/portfolio/${slug(c)}-${i + 1}.webp`)])
);

const whyCards = [
    { icon: RefreshCw, title: "Unlimited Revisions", desc: "We keep polishing your illustrations until every page feels exactly the way you imagined it." },
    { icon: Wallet, title: "Affordable Services", desc: "Packages built around your budget and page count, so every author can afford a beautifully illustrated book." },
    { icon: Lightbulb, title: "Creative Elements", desc: "Fresh characters, playful colors and new ideas that keep young readers turning the page." },
    { icon: Clock, title: "Quick Turnaround", desc: "Clear milestones and on-time delivery, with your first sketches ready in days, not weeks." },
    { icon: LayoutGrid, title: "Loads of Layouts", desc: "Full spreads, spot art, vignettes and borders — pick the page layouts that suit your story." },
    { icon: Award, title: "100% Ownership", desc: "Once the project is complete, you own every illustration and all the source files." },
];

const processSteps = [
    { step: "01", title: "Place Your Order", desc: "Share a brief overview of your story, characters and target age group. Not sure yet? We'll help you shape the idea." },
    { step: "02", title: "Get Your First Draft in 4–7 Days", desc: "Our illustrators get to work and send you the first black-and-white sketches within 4–7 business days." },
    { step: "03", title: "Revise Until It's Right", desc: "We work closely with you to refine characters, colors and scenes. There's no limit on the number of revisions." },
    { step: "04", title: "Delivery", desc: "Once you're happy with every page, we deliver print-ready and digital files, formatted for publishing." },
];

const TRUST = { score: "4.9", label: "Excellent", reviews: "300+" };

const testimonials = [
    { name: "David Torres", location: "US", date: "Aug 14, 2026", rating: 5, title: "My kids love these characters", quote: "They turned my rough story notes into characters my kids now ask about every night. The whole process was smooth and friendly." },
    { name: "Priya Nair", location: "GB", date: "Jul 29, 2026", rating: 5, title: "Exactly what I pictured", quote: "From the first sketch to the final spread, the team listened to every detail. The colors are exactly what I pictured." },
    { name: "Samantha Thornhill", location: "US", date: "Jul 10, 2026", rating: 5, title: "Simple, quick and unlimited changes", quote: "I was nervous about illustrations, but Bexley made it simple. Quick drafts, unlimited changes, and a book I'm proud of." },
    { name: "Marcus Webb", location: "CA", date: "Jun 22, 2026", rating: 5, title: "Brought my dragons to life", quote: "Affordable, fast and truly creative. Their fantasy art brought my dragons to life in a way young readers love." },
    { name: "Emily Rose", location: "AU", date: "Jun 03, 2026", rating: 5, title: "Warm, gentle illustrations", quote: "Warm, gentle illustrations that match the tone of my story perfectly. I'd recommend them to any picture-book author." },
];

/* Trustpilot-style square star blocks, in the brand red */
function TrustStars({ rating, size = 22 }: { rating: number; size?: number }) {
    return (
        <div className="cb-tp-stars" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`cb-tp-star ${i < Math.round(rating) ? "on" : ""}`} style={{ width: size, height: size }}>
                    <Star size={size * 0.62} fill="white" stroke="white" />
                </span>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   SMALL SHARED PIECES
══════════════════════════════════════════════════════════════ */
function Eyebrow({ children, center = false }: { children: ReactNode; center?: boolean }) {
    return (
        <div className={`cb-eyebrow ${center ? "center" : ""}`}>
            <span className="cb-eyebrow-line" />
            <span className="cb-eyebrow-text">{children}</span>
            {center && <span className="cb-eyebrow-line" />}
        </div>
    );
}

function ActionButtons({ dark = false }: { dark?: boolean }) {
    return (
        <div className="cb-actions">
            <button type="button" className="cb-btn cb-btn-primary" onClick={getStarted}>
                Get Started <ArrowRight size={16} />
            </button>
            <button type="button" className={`cb-btn ${dark ? "cb-btn-ghost-dark" : "cb-btn-ghost"}`} onClick={openLiveChat}>
                <MessageCircle size={16} /> Live Chat
            </button>
        </div>
    );
}

function Wave({ fill, flip = false }: { fill: string; flip?: boolean }) {
    return (
        <svg className={`cb-wave ${flip ? "flip" : ""}`} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,64 C240,120 480,0 720,48 C960,96 1200,24 1440,72 L1440,120 L0,120 Z" fill={fill} />
        </svg>
    );
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
        <header className={`cb-header ${scrolled ? "scrolled" : ""}`}>
            <div className="cb-header-inner">
                {/* Landing page: logo scrolls back to top instead of leaving the page */}
                <a href="#top" className="cb-logo" aria-label={`${BRAND.name}, back to top`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMG.headerLogo} alt={BRAND.name} className="cb-logo-img" />
                </a>

                <div className="cb-header-right">
                    <a href={BRAND.phoneHref} className="cb-header-phone" aria-label={`Call ${BRAND.phone}`}>
                        <span className="cb-header-phone-icon"><Phone size={15} /></span>
                        <span className="cb-header-phone-text">{BRAND.phone}</span>
                    </a>
                    <button type="button" className="cb-btn cb-btn-primary cb-btn-sm" onClick={getStarted}>Get Started</button>
                </div>
            </div>
        </header>
    );
}

/* ══════════════════════════════════════════════════════════════
   LEAD FORM (hero)
══════════════════════════════════════════════════════════════ */
function LeadForm() {
    const { form, status, errorMsg, handle, submit } = useLeadForm();
    const loading = status === "loading";
    return (
        <motion.div
            id="cb-hero-form"
            className="cb-form-card"
            initial={{ opacity: 0, y: 40, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: smoothEase }}
        >
            <span className="cb-form-dot d1" /><span className="cb-form-dot d2" /><span className="cb-form-dot d3" />
            <p className="cb-form-title">Limited Time Offer <span>50% Off</span></p>
            <form onSubmit={submit} className="cb-form">
                <input name="name" type="text" placeholder="Your name" required aria-label="Your name" value={form.name} onChange={handle} disabled={loading} />
                <input name="email" type="email" placeholder="Your email" required aria-label="Your email" value={form.email} onChange={handle} disabled={loading} />
                <input name="phone" type="tel" placeholder="Your phone number" required aria-label="Your phone number" value={form.phone} onChange={handle} disabled={loading} />
                <textarea name="message" rows={3} placeholder="Tell us about your book" aria-label="Tell us about your book" value={form.message} onChange={handle} disabled={loading} />
                <button type="submit" className="cb-btn cb-btn-primary cb-btn-block" disabled={loading}>
                    {loading ? <><Loader2 size={16} className="cb-spin" /> Sending…</> : <>Claim My Discount <Send size={15} /></>}
                </button>
                {status === "error" && <p className="cb-form-err" role="alert"><AlertCircle size={15} /> {errorMsg}</p>}
            </form>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════
   CTA BAND (used twice)
══════════════════════════════════════════════════════════════ */
function CtaBand({ line, image, imageAlt }: { line: string; image: string; imageAlt: string }) {
    return (
        <section className="cb-band">
            <div className="cb-band-bg" aria-hidden="true" />
            <span className="cb-band-circle c1" aria-hidden="true" />
            <span className="cb-band-circle c2" aria-hidden="true" />
            <div className="cb-band-inner">
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="cb-band-content">
                    <motion.p variants={fadeUp} className="cb-band-line">{line}</motion.p>
                    <motion.h2 variants={maskReveal} className="cb-band-h2">TALK TO US TODAY!</motion.h2>
                    <motion.div variants={fadeUp} className="cb-band-row">
                        <div className="cb-actions">
                            <button type="button" className="cb-btn cb-btn-dark" onClick={getStarted}>Get Started <ArrowRight size={16} /></button>
                            <button type="button" className="cb-btn cb-btn-ghost" onClick={openLiveChat}><MessageCircle size={16} /> Live Chat</button>
                        </div>
                        <a href={BRAND.phoneHref} className="cb-band-call">Call us at: <strong>{BRAND.phone}</strong></a>
                    </motion.div>
                </motion.div>
                <motion.div
                    className="cb-band-img"
                    initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: smoothEase }}
                >
                    <Img src={image} alt={imageAlt} />
                </motion.div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   PORTFOLIO
══════════════════════════════════════════════════════════════ */
function Portfolio() {
    const [active, setActive] = useState(categories[0]);
    const items = portfolio[active].slice(0, 12);
    return (
        <section id="portfolio" className="cb-portfolio">
            <div className="cb-inner">
                <div className="cb-section-head center">
                    <Eyebrow center>Our Portfolio</Eyebrow>
                    <motion.h2 variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="cb-h2">
                        SOME OF OUR STELLAR <span className="accent">BOOK ILLUSTRATIONS</span>
                    </motion.h2>
                    <p className="cb-sub">We've created illustrations for countless books across every genre. Have a look at some of our best work so far.</p>
                </div>

                <div className="cb-tabs" role="tablist" aria-label="Illustration categories">
                    {categories.map((c) => (
                        <button
                            key={c} type="button" role="tab" aria-selected={active === c}
                            className={`cb-tab ${active === c ? "active" : ""}`} onClick={() => setActive(c)}
                        >
                            {c}
                            {active === c && <motion.span layoutId="cb-tab-pill" className="cb-tab-pill" transition={{ duration: 0.4, ease: smoothEase }} />}
                        </button>
                    ))}
                </div>

                <motion.div layout className="cb-gallery">
                    <AnimatePresence mode="popLayout">
                        {items.map((src, i) => (
                            <motion.div
                                key={src} layout className="cb-gallery-item"
                                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.45, delay: i * 0.03, ease: smoothEase }}
                            >
                                <Img src={src} alt={`${active} illustration ${i + 1}`} />
                                <div className="cb-gallery-overlay"><span>{active}</span></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                <div className="cb-center-actions"><ActionButtons dark /></div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   TESTIMONIAL SLIDER
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
        <section className="cb-testimonials">
            <div className="cb-inner">
                <div className="cb-section-head center">
                    <Eyebrow center>Testimonials</Eyebrow>
                    <motion.h2 variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="cb-h2 light">
                        HERE'S WHAT OUR <span className="accent">AUTHORS SAY</span>
                    </motion.h2>
                </div>

                {/* Trustpilot-style summary bar */}
                <motion.div className="cb-tp-summary" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <span className="cb-tp-label">{TRUST.label}</span>
                    <TrustStars rating={5} size={30} />
                    <span className="cb-tp-meta">Rated <strong>{TRUST.score}</strong> / 5 based on <strong>{TRUST.reviews} reviews</strong></span>
                    <span className="cb-tp-brand"><Star size={20} fill="#e8391d" stroke="#e8391d" /> Trustpilot</span>
                </motion.div>

                <div className="cb-slider">
                    <div className="cb-slider-track" style={{ transform: `translateX(-${(index * 100) / perView}%)` }}>
                        {testimonials.map(({ name, location, date, rating, title, quote }) => (
                            <div key={name} className="cb-slide" style={{ flex: `0 0 ${100 / perView}%` }}>
                                <article className="cb-tp-card">
                                    <header className="cb-tp-head">
                                        <span className="cb-tp-avatar" aria-hidden="true">{name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                                        <div className="cb-tp-who">
                                            <p className="cb-tp-name">{name}</p>
                                            <p className="cb-tp-loc">{location} · 1 review</p>
                                        </div>
                                    </header>
                                    <div className="cb-tp-rowline">
                                        <TrustStars rating={rating} size={20} />
                                        <span className="cb-tp-verified"><BadgeCheck size={14} /> Verified</span>
                                    </div>
                                    <h3 className="cb-tp-title">{title}</h3>
                                    <p className="cb-tp-text">{quote}</p>
                                    <p className="cb-tp-date"><strong>Date of experience:</strong> {date}</p>
                                </article>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cb-dots">
                    {Array.from({ length: pages }).map((_, i) => (
                        <button key={i} type="button" aria-label={`Show testimonial ${i + 1}`} className={`cb-dot ${i === index ? "active" : ""}`} onClick={() => setIndex(i)} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════
   GET STARTED POPUP (web only — opened by getStarted())
══════════════════════════════════════════════════════════════ */
function GetStartedPopup() {
    const [open, setOpen] = useState(false);
    const { form, status, errorMsg, handle, submit } = useLeadForm("Children's Book Illustration (Popup)");
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
        // close automatically if the window shrinks to tablet/mobile size
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
                <motion.div
                    className="cb-pop-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        className="cb-pop"
                        role="dialog" aria-modal="true" aria-labelledby="cb-pop-title"
                        initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }}
                        transition={{ duration: 0.5, ease: smoothEase }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Vertical offer text */}
                        <div className="cb-pop-side" aria-hidden="true">
                            <span>Fill this form to avail special discounts of</span>
                            <strong>Up To 50%!</strong>
                        </div>

                        {/* Headline + form */}
                        <div className="cb-pop-main">
                            <h2 id="cb-pop-title" className="cb-pop-h">
                                Looking For Professional Illustration Design Services
                                <span>At Affordable Rates?</span>
                            </h2>
                            <form className="cb-pop-form" onSubmit={submit}>
                                <input ref={firstInput} name="name" type="text" placeholder="Name" required aria-label="Name" value={form.name} onChange={handle} disabled={loading} />
                                <input name="email" type="email" placeholder="Enter your email here" required aria-label="Email" value={form.email} onChange={handle} disabled={loading} />
                                <input name="phone" type="tel" placeholder="Phone number" required aria-label="Phone number" value={form.phone} onChange={handle} disabled={loading} />
                                <textarea name="message" rows={4} placeholder="Talk about your project" aria-label="Talk about your project" value={form.message} onChange={handle} disabled={loading} />
                                <button type="submit" className="cb-pop-submit" disabled={loading}>
                                    {loading ? <><Loader2 size={16} className="cb-spin" /> Sending…</> : "Submit"}
                                </button>
                                {status === "error" && <p className="cb-form-err" role="alert"><AlertCircle size={15} /> {errorMsg}</p>}
                            </form>
                        </div>

                        {/* Character art on a panel */}
                        <div className="cb-pop-art">
                            <div className="cb-pop-panel">
                                <button type="button" className="cb-pop-close" aria-label="Close" onClick={() => setOpen(false)}><X size={20} /></button>
                            </div>
                            <Img src={IMG.popup} alt="Illustrated character" className="cb-pop-img" />
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
    const { form, status, errorMsg, handle, submit } = useLeadForm();
    const loading = status === "loading";
    return (
        <footer id="contact" className="cb-footer">
            <div className="cb-footer-inner">
                <div className="cb-footer-brand">
                    <a href="#top" className="cb-logo" aria-label={`${BRAND.name}, back to top`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={IMG.footerLogo} alt={BRAND.name} className="cb-logo-img footer" />
                    </a>
                    <p>We help authors turn raw ideas into professionally written and beautifully illustrated books that readers of every age love.</p>
                </div>

                <div className="cb-footer-col">
                    <p className="cb-footer-h">Address</p>
                    <p className="cb-footer-line"><MapPin size={15} /> <span>{BRAND.headOffice}</span></p>
                    <p className="cb-footer-h">Phone</p>
                    <a className="cb-footer-line" href={BRAND.phoneHref}><Phone size={15} /> <span>{BRAND.phone}</span></a>
                    <p className="cb-footer-h">Email</p>
                    <a className="cb-footer-line" href={`mailto:${BRAND.email}`}><Mail size={15} /> <span>{BRAND.email}</span></a>
                </div>

                <div className="cb-footer-col">
                    <p className="cb-footer-h big">Get In Touch</p>
                    <form className="cb-footer-form" onSubmit={submit}>
                        <input name="name" type="text" placeholder="Your name" required aria-label="Your name" value={form.name} onChange={handle} disabled={loading} />
                        <div className="cb-footer-row">
                            <input name="email" type="email" placeholder="Your email" required aria-label="Your email" value={form.email} onChange={handle} disabled={loading} />
                            <input name="phone" type="tel" placeholder="Your phone" required aria-label="Your phone" value={form.phone} onChange={handle} disabled={loading} />
                        </div>
                        <textarea name="message" rows={3} placeholder="Your message" aria-label="Your message" value={form.message} onChange={handle} disabled={loading} />
                        <button type="submit" className="cb-btn cb-btn-primary" disabled={loading}>
                            {loading ? <><Loader2 size={16} className="cb-spin" /> Sending…</> : <>Send Message <Send size={15} /></>}
                        </button>
                        {status === "error" && <p className="cb-form-err light" role="alert"><AlertCircle size={15} /> {errorMsg}</p>}
                    </form>
                </div>
            </div>
            <div className="cb-footer-bottom">
                <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
                <nav aria-label="Legal">{LEGAL_LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function ChildLandingPage() {
    const agencyRef = useRef<HTMLDivElement>(null);
    const agencyInView = useInView(agencyRef, { once: true, margin: "-100px" });

    return (
        <>
            <style>{`
                /* ═══ TOKENS & GLOBAL ═══ */
                .cb-main {
                    --red: #e8391d; --red-dark: #c0271a; --ink: #05070f; --cream: #faf9f7;
                    --sun: #ffc83d; --sky: #4fb3ff; --grey: #6b7280;
                    width: 100%; overflow: hidden; font-family: var(--font-raleway), 'Raleway', Arial, sans-serif; color: var(--ink); background: var(--cream);
                }
                .cb-main *, .cb-main *::before, .cb-main *::after { box-sizing: border-box; }
                .cb-main a { text-decoration: none; color: inherit; }
                .cb-main :focus-visible { outline: 3px solid var(--sun); outline-offset: 3px; border-radius: 6px; }
                .cb-inner { max-width: 1240px; margin: 0 auto; padding: 0 64px; position: relative; z-index: 2; }

                .cb-ph {
                    width: 100%; height: 100%; min-height: 160px; display: flex; flex-direction: column; gap: 8px;
                    align-items: center; justify-content: center; text-align: center; padding: 16px;
                    background: repeating-linear-gradient(45deg, rgba(232,57,29,0.06) 0 12px, rgba(255,200,61,0.08) 12px 24px);
                    color: rgba(232,57,29,0.6); font-size: 12px; font-weight: 700; border-radius: inherit;
                }

                .cb-wave { position: absolute; left: 0; bottom: -1px; width: 100%; height: 90px; display: block; z-index: 3; }
                .cb-wave.flip { top: -1px; bottom: auto; transform: rotate(180deg); }

                /* ═══ EYEBROW / HEADINGS ═══ */
                .cb-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
                .cb-eyebrow.center { justify-content: center; }
                .cb-eyebrow-line { display: block; width: 32px; height: 2px; background: var(--red); flex-shrink: 0; }
                .cb-eyebrow-text { color: var(--red); font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.28em; }

                .cb-h2 { font-weight: 900; text-transform: uppercase; line-height: 1.05; font-size: clamp(2rem, 3.5vw, 3rem); color: var(--ink); }
                .cb-h2.light { color: white; }
                .cb-h2 .accent { color: var(--red); }
                .cb-section-head { margin-bottom: 56px; }
                .cb-section-head.center { text-align: center; max-width: 820px; margin-left: auto; margin-right: auto; }
                .cb-sub { color: var(--grey); font-size: 15px; line-height: 1.75; margin-top: 18px; }

                /* ═══ BUTTONS ═══ */
                .cb-actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
                .cb-center-actions { display: flex; justify-content: center; margin-top: 52px; }
                .cb-btn {
                    display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 2px solid transparent;
                    font-family: inherit; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;
                    padding: 15px 28px; border-radius: 12px; cursor: pointer;
                    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, gap 0.2s ease, box-shadow 0.2s ease;
                }
                .cb-btn:hover { gap: 14px; }
                .cb-btn-primary { background: var(--red); color: white; }
                .cb-btn-primary:hover { background: var(--red-dark); box-shadow: 0 10px 40px rgba(232,57,29,0.4); }
                .cb-btn-dark { background: var(--ink); color: white; }
                .cb-btn-dark:hover { background: white; color: var(--red); }
                .cb-btn-ghost { background: transparent; color: white; border-color: rgba(255,255,255,0.6); }
                .cb-btn-ghost:hover { background: white; color: var(--ink); border-color: white; }
                .cb-btn-ghost-dark { background: transparent; color: var(--ink); border-color: var(--ink); }
                .cb-btn-ghost-dark:hover { background: var(--ink); color: white; }
                .cb-btn-sm { padding: 11px 20px; font-size: 11px; }
                .cb-btn-block { width: 100%; }

                /* ═══ HEADER ═══ */
                .cb-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background 0.3s ease, box-shadow 0.3s ease, padding 0.3s ease; padding: 20px 0; }
                .cb-header.scrolled { background: rgba(5,7,15,0.92); backdrop-filter: blur(12px); box-shadow: 0 8px 30px rgba(0,0,0,0.25); padding: 12px 0; }
                .cb-header-inner { max-width: 1320px; margin: 0 auto; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
                .cb-logo { display: inline-flex; align-items: center; gap: 10px; color: white; }
                .cb-logo-img { height: 52px; width: auto; display: block; object-fit: contain; transition: height 0.3s ease; }
                .cb-header.scrolled .cb-logo-img { height: 44px; }
                .cb-logo-img.footer { height: 64px; }
                .cb-header-right { display: flex; align-items: center; gap: 18px; }
                .cb-header-phone { display: inline-flex; align-items: center; gap: 10px; color: white !important; font-weight: 700; font-size: 14px; }
                .cb-header-phone-icon { width: 36px; height: 36px; border-radius: 50%; background: rgba(232,57,29,0.15); color: var(--red); display: inline-flex; align-items: center; justify-content: center; transition: background 0.2s ease, color 0.2s ease; }
                .cb-header-phone:hover .cb-header-phone-icon { background: var(--red); color: white; }

                /* ═══ HERO ═══ */
                .cb-hero { position: relative; background: var(--ink); padding: 170px 0 170px; overflow: hidden; }
                .cb-hero-glow { position: absolute; top: 40%; left: 30%; width: 800px; height: 800px; border-radius: 50%; transform: translate(-50%, -50%); background: rgba(232,57,29,0.14); filter: blur(150px); pointer-events: none; }
                .cb-hero-dots { position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 30px 30px; pointer-events: none; }
                .cb-hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px; align-items: center; }
                .cb-hero-h1 { font-weight: 900; color: white; text-transform: uppercase; line-height: 0.98; font-size: clamp(2.8rem, 5.2vw, 4.8rem); margin-bottom: 28px; }
                .cb-hero-h1 .accent { color: var(--red); display: block; }
                .cb-hero-h1 .scribble { position: relative; display: inline-block; }
                .cb-hero-h1 .scribble svg { position: absolute; left: -2%; bottom: -14px; width: 104%; height: 18px; }
                .cb-hero-sub { color: rgba(255,255,255,0.65); line-height: 1.85; max-width: 520px; font-size: clamp(0.95rem, 1.1vw, 1.05rem); margin-bottom: 36px; }
                .cb-hero-perks { display: flex; flex-wrap: wrap; gap: 22px; margin-top: 36px; }
                .cb-hero-perk { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 600; }
                .cb-hero-perk svg { color: var(--sun); }

                .cb-hero-kid { position: absolute; z-index: 1; pointer-events: none; }
                .cb-hero-kid img, .cb-hero-kid .cb-ph { width: 100%; height: 100%; object-fit: contain; }
                .cb-hero-kid .cb-ph { display: none; }
                .cb-hero-kid.left { left: 1%; bottom: 90px; width: 150px; height: 190px; z-index: 50; }
                .cb-hero-kid.right { right: 1%; top: 150px; width: 170px; height: 210px; z-index: 50; }

                .cb-float { position: absolute; border-radius: 50%; pointer-events: none; z-index: 1; }
                .cb-float.f1 { width: 22px; height: 22px; background: var(--sun); top: 22%; left: 46%; }
                .cb-float.f2 { width: 14px; height: 14px; background: var(--sky); top: 70%; left: 8%; }
                .cb-float.f3 { width: 34px; height: 34px; border: 3px solid var(--red); top: 16%; right: 18%; }
                .cb-float.f4 { width: 12px; height: 12px; background: var(--red); bottom: 26%; right: 42%; }

                .cb-form-card { position: relative; z-index: 2; background: white; border-radius: 40px 40px 40px 12px; padding: 44px 40px 40px; box-shadow: 0 40px 100px rgba(0,0,0,0.45); }
                .cb-form-card::before { content: ""; position: absolute; inset: -14px 14px 14px -14px; border: 3px dashed rgba(255,200,61,0.55); border-radius: 44px 44px 44px 16px; z-index: -1; }
                .cb-form-dot { position: absolute; border-radius: 50%; }
                .cb-form-dot.d1 { width: 18px; height: 18px; background: var(--sun); top: -8px; right: 60px; }
                .cb-form-dot.d2 { width: 12px; height: 12px; background: var(--sky); top: 30px; right: -6px; }
                .cb-form-dot.d3 { width: 10px; height: 10px; background: var(--red); bottom: 60px; left: -5px; }
                .cb-form-title { font-weight: 900; font-size: 20px; text-transform: uppercase; margin-bottom: 22px; line-height: 1.2; }
                .cb-form-title span { color: var(--red); }
                .cb-form { display: flex; flex-direction: column; gap: 12px; }
                .cb-form input, .cb-form textarea, .cb-footer-form input, .cb-footer-form textarea {
                    width: 100%; font-family: inherit; font-size: 14px; padding: 14px 16px; border-radius: 10px;
                    border: 1.5px solid #ececec; background: #f7f7f7; color: var(--ink); resize: vertical; transition: border-color 0.2s ease, background 0.2s ease;
                }
                .cb-form input:focus, .cb-form textarea:focus { outline: none; border-color: var(--red); background: white; }
                .cb-form input:disabled, .cb-form textarea:disabled, .cb-footer-form input:disabled, .cb-footer-form textarea:disabled { opacity: 0.6; cursor: not-allowed; }
                .cb-btn:disabled { opacity: 0.75; cursor: wait; }
                .cb-btn:disabled:hover { gap: 10px; box-shadow: none; }
                .cb-form-err { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.5; font-weight: 600; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; padding: 10px 12px; border-radius: 10px; }
                .cb-form-err svg { flex-shrink: 0; margin-top: 2px; }
                .cb-form-err.light { color: #fca5a5; background: rgba(232,57,29,0.1); border-color: rgba(232,57,29,0.35); }
                .cb-spin { animation: cb-spin 0.9s linear infinite; }
                @keyframes cb-spin { to { transform: rotate(360deg); } }

                /* ═══ AGENCY ═══ */
                .cb-agency { position: relative; padding: 120px 0; background: var(--cream); }
                .cb-agency-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
                .cb-agency-img { position: relative; aspect-ratio: 5/4; }
                .cb-agency-img img, .cb-agency-img .cb-ph { width: 100%; height: 100%; object-fit: contain; border-radius: 24px; }
                .cb-agency-blob { position: absolute; inset: 8% 6% 0 10%; background: rgba(255,200,61,0.25); border-radius: 46% 54% 42% 58% / 55% 45% 55% 45%; z-index: -1; }
                .cb-agency-body { color: var(--grey); line-height: 1.85; font-size: 0.95rem; margin: 24px 0 32px; padding-bottom: 32px; border-bottom: 1px solid #e8e4dd; }
                .cb-feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 28px; }
                .cb-feature { display: flex; align-items: center; gap: 14px; }
                .cb-feature-icon { width: 46px; height: 46px; border-radius: 12px; background: rgba(232,57,29,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--red); }
                .cb-feature p { font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; line-height: 1.35; }

                /* ═══ CTA BAND ═══ */
                .cb-band { position: relative; background: var(--red); overflow: hidden; }
                .cb-band-bg { position: absolute; inset: 0; opacity: 0.08; background-image: radial-gradient(#fff 1.5px, transparent 1.5px); background-size: 26px 26px; }
                .cb-band-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.08); }
                .cb-band-circle.c1 { width: 360px; height: 360px; left: -120px; top: -140px; }
                .cb-band-circle.c2 { width: 220px; height: 220px; left: 40%; bottom: -130px; }
                .cb-band-inner { max-width: 1200px; margin: 0 auto; padding: 0 64px; display: grid; grid-template-columns: 1.4fr 1fr; align-items: center; gap: 40px; position: relative; z-index: 2; min-height: 320px; }
                .cb-band-content { padding: 64px 0; }
                .cb-band-line { color: rgba(255,255,255,0.85); font-size: 18px; line-height: 1.5; max-width: 520px; margin-bottom: 10px; }
                .cb-band-h2 { color: white; font-weight: 900; font-size: clamp(2rem, 3.4vw, 3rem); line-height: 1.05; margin-bottom: 28px; }
                .cb-band-row { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; }
                .cb-band-call { color: rgba(255,255,255,0.85); font-size: 14px; }
                .cb-band-call strong { color: white; font-weight: 900; }
                .cb-band-img { align-self: end; height: 320px; display: flex; align-items: flex-end; justify-content: center; }
                .cb-band-img img { max-height: 100%; max-width: 100%; object-fit: contain; }
                .cb-band-img .cb-ph { height: 260px; border-radius: 24px 24px 0 0; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }

                /* ═══ PORTFOLIO ═══ */
                .cb-portfolio { position: relative; padding: 120px 0; background: white; }
                .cb-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 44px; }
                .cb-tab { position: relative; background: none; border: none; font-family: inherit; font-weight: 700; font-size: 13px; color: var(--ink); padding: 10px 18px; border-radius: 999px; cursor: pointer; z-index: 0; transition: color 0.25s ease; }
                .cb-tab:hover { color: var(--red); }
                .cb-tab.active { color: white; }
                .cb-tab-pill { position: absolute; inset: 0; background: var(--red); border-radius: 999px; z-index: -1; }
                .cb-gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
                .cb-gallery-item { position: relative; aspect-ratio: 1/1; border-radius: 18px; overflow: hidden; background: #f3f0ea; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
                .cb-gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
                .cb-gallery-item:hover img { transform: scale(1.08); }
                .cb-gallery-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,7,15,0.75), transparent 55%); opacity: 0; display: flex; align-items: flex-end; padding: 16px; transition: opacity 0.3s ease; }
                .cb-gallery-overlay span { color: white; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; }
                .cb-gallery-item:hover .cb-gallery-overlay { opacity: 1; }

                /* ═══ WHY ═══ */
                .cb-why { position: relative; padding: 120px 0; background: var(--cream); }
                .cb-why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
                .cb-why-card { background: white; border-radius: 20px; padding: 32px; border: 1px solid #f0ece5; box-shadow: 0 4px 20px rgba(0,0,0,0.04); transition: border-color 0.3s ease, box-shadow 0.4s ease, transform 0.4s ease; }
                .cb-why-card:hover { border-color: rgba(232,57,29,0.35); box-shadow: 0 18px 44px rgba(0,0,0,0.1); transform: translateY(-4px); }
                .cb-why-top { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
                .cb-why-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(232,57,29,0.1); color: var(--red); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.3s ease, color 0.3s ease; }
                .cb-why-card:hover .cb-why-icon { background: var(--red); color: white; }
                .cb-why-title { font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 0.06em; line-height: 1.3; }
                .cb-why-desc { color: var(--grey); font-size: 14px; line-height: 1.7; }

                /* ═══ PROCESS ═══ */
                .cb-process { position: relative; padding: 120px 0; background: var(--ink); }
                .cb-process-dots { position: absolute; inset: 0; opacity: 0.04; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 30px 30px; }
                .cb-process-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 80px; align-items: start; }
                .cb-process-left { position: sticky; top: 120px; }
                .cb-process-left .cb-sub { color: rgba(255,255,255,0.55); max-width: 380px; }
                .cb-process-img { margin-top: 40px; aspect-ratio: 1/1; max-width: 420px; position: relative; }
                .cb-process-img::before { content: ""; position: absolute; inset: 8%; border-radius: 50%; background: rgba(232,57,29,0.18); filter: blur(40px); }
                .cb-process-img img, .cb-process-img .cb-ph { position: relative; width: 100%; height: 100%; object-fit: contain; border-radius: 24px; }
                .cb-process-img .cb-ph { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4); }
                .cb-steps { display: flex; flex-direction: column; gap: 14px; }
                .cb-step { display: grid; grid-template-columns: 76px 1fr; gap: 20px; padding: 28px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); transition: border-color 0.4s ease; }
                .cb-step:hover { border-color: rgba(232,57,29,0.5); }
                .cb-step-num { font-weight: 900; font-size: 44px; line-height: 1; color: var(--red); }
                .cb-step-num small { display: block; font-size: 10px; letter-spacing: 0.25em; color: rgba(255,255,255,0.35); margin-top: 6px; }
                .cb-step h3 { color: white; font-weight: 900; text-transform: uppercase; font-size: 17px; letter-spacing: 0.04em; margin-bottom: 10px; }
                .cb-step p { color: rgba(255,255,255,0.55); font-size: 14px; line-height: 1.7; }
                .cb-steps .cb-btn { align-self: flex-start; margin-top: 20px; }

                /* ═══ TESTIMONIALS ═══ */
                .cb-testimonials { position: relative; padding: 120px 0; background: #111; }
                .cb-slider { overflow: hidden; margin: 0 -12px; }
                .cb-slider-track { display: flex; transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
                .cb-slide { padding: 0 12px; }
                /* Trustpilot-style stars (brand red) */
                .cb-tp-stars { display: inline-flex; gap: 3px; }
                .cb-tp-star { display: inline-flex; align-items: center; justify-content: center; background: #dcdce6; border-radius: 2px; }
                .cb-tp-star.on { background: var(--red); }

                /* Summary bar */
                .cb-tp-summary { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px 20px; margin: -16px auto 48px; padding: 18px 28px; max-width: 860px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; }
                .cb-tp-label { color: white; font-weight: 900; font-size: 22px; }
                .cb-tp-meta { color: rgba(255,255,255,0.65); font-size: 14px; }
                .cb-tp-meta strong { color: white; }
                .cb-tp-brand { display: inline-flex; align-items: center; gap: 6px; color: white; font-weight: 800; font-size: 18px; letter-spacing: -0.01em; }

                /* Review card */
                .cb-tp-card { height: 100%; display: flex; flex-direction: column; background: white; border-radius: 10px; padding: 26px; border: 1px solid #e5e5ec; transition: box-shadow 0.35s ease, transform 0.35s ease; }
                .cb-tp-card:hover { box-shadow: 0 18px 40px rgba(0,0,0,0.35); transform: translateY(-3px); }
                .cb-tp-head { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #efeff4; }
                .cb-tp-avatar { width: 42px; height: 42px; border-radius: 50%; background: rgba(232,57,29,0.12); color: var(--red); font-weight: 900; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .cb-tp-name { font-weight: 800; font-size: 15px; color: #191919; }
                .cb-tp-loc { font-size: 12px; color: #6c6c85; margin-top: 2px; }
                .cb-tp-rowline { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
                .cb-tp-verified { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #6c6c85; }
                .cb-tp-verified svg { color: var(--red); }
                .cb-tp-title { font-weight: 800; font-size: 16px; color: #191919; margin-bottom: 8px; line-height: 1.35; }
                .cb-tp-text { color: #3f3f55; font-size: 14.5px; line-height: 1.7; flex: 1; }
                .cb-tp-date { font-size: 12px; color: #6c6c85; margin-top: 18px; padding-top: 14px; border-top: 1px solid #efeff4; }
                .cb-tp-date strong { color: #191919; font-weight: 700; }
                .cb-dots { display: flex; justify-content: center; gap: 10px; margin-top: 40px; }
                .cb-dot { width: 10px; height: 10px; border-radius: 999px; border: none; background: rgba(255,255,255,0.25); cursor: pointer; transition: width 0.35s ease, background 0.35s ease; padding: 0; }
                .cb-dot.active { width: 30px; background: var(--red); }

                /* ═══ FINAL CTA ═══ */
                .cb-final { position: relative; padding: 120px 0; background: var(--cream); }
                .cb-final-grid { display: grid; grid-template-columns: 1fr 1.6fr 1fr; gap: 32px; align-items: center; }
                .cb-final-img { aspect-ratio: 4/5; }
                .cb-final-img img, .cb-final-img .cb-ph { width: 100%; height: 100%; object-fit: contain; border-radius: 24px; }
                .cb-final-center { text-align: center; }
                .cb-final-center .cb-sub { margin-bottom: 32px; }
                .cb-final-center .cb-actions { justify-content: center; }

                /* ═══ FOOTER ═══ */
                .cb-footer { background: var(--ink); color: rgba(255,255,255,0.6); border-top: 4px solid var(--red); }
                .cb-footer-inner { max-width: 1200px; margin: 0 auto; padding: 88px 64px 56px; display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 56px; }
                .cb-footer-brand p { margin-top: 22px; font-size: 14px; line-height: 1.8; max-width: 320px; }
                .cb-footer-h { color: white; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.14em; margin: 22px 0 10px; }
                .cb-footer-h:first-child { margin-top: 0; }
                .cb-footer-h.big { font-size: 20px; letter-spacing: 0.04em; margin-bottom: 20px; }
                .cb-footer-line { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; line-height: 1.6; margin-bottom: 8px; transition: color 0.2s ease; }
                .cb-footer-line svg { color: var(--red); flex-shrink: 0; margin-top: 3px; }
                a.cb-footer-line:hover { color: white; }
                .cb-footer-form { display: flex; flex-direction: column; gap: 12px; }
                .cb-footer-form input, .cb-footer-form textarea { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: white; }
                .cb-footer-form input::placeholder, .cb-footer-form textarea::placeholder { color: rgba(255,255,255,0.4); }
                .cb-footer-form input:focus, .cb-footer-form textarea:focus { outline: none; border-color: var(--red); }
                .cb-footer-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .cb-footer-form .cb-btn { align-self: flex-start; }
                .cb-footer-bottom { max-width: 1200px; margin: 0 auto; padding: 24px 64px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13px; }
                .cb-footer-bottom nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; }
                .cb-footer-bottom a:hover { color: var(--red); }


                /* ═══ GET STARTED POPUP (web only) ═══ */
                .cb-pop-backdrop {
                    position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 40px;
                    background: rgba(5,7,15,0.35); backdrop-filter: blur(12px) saturate(1.1); -webkit-backdrop-filter: blur(12px) saturate(1.1);
                }
                .cb-pop { position: relative; display: grid; grid-template-columns: auto 330px 380px; align-items: end; gap: 0; max-height: calc(100vh - 80px); }

                .cb-pop-side { writing-mode: vertical-rl; transform: rotate(180deg); display: flex; flex-direction: column; gap: 4px; align-self: end; margin-right: 14px; padding-bottom: 4px; }
                .cb-pop-side span { color: white; font-size: 15px; font-weight: 500; letter-spacing: 0.02em; text-shadow: 0 2px 16px rgba(0,0,0,0.6); }
                .cb-pop-side strong { color: white; font-size: 34px; font-weight: 900; line-height: 1; text-shadow: 0 4px 24px rgba(0,0,0,0.65); }

                .cb-pop-main { position: relative; z-index: 2; }
                .cb-pop-h { position: relative; color: white; font-weight: 900; font-size: 23px; line-height: 1.15; margin-bottom: 16px; width: 360px; text-shadow: 0 2px 18px rgba(0,0,0,0.6); }
                .cb-pop-h::before { content: ""; position: absolute; inset: -18px -24px -14px -24px; background: rgba(5,7,15,0.35); filter: blur(22px); border-radius: 40px; z-index: -1; }
                .cb-pop-h span { display: block; font-weight: 400; font-size: 21px; margin-top: 6px; }

                .cb-pop-form { background: var(--red); border-radius: 6px; padding: 24px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 30px 70px rgba(0,0,0,0.4); }
                .cb-pop-form input, .cb-pop-form textarea {
                    width: 100%; font-family: inherit; font-size: 13px; padding: 12px 10px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.08);
                    background: white; color: var(--ink); resize: vertical;
                }
                .cb-pop-form input:focus, .cb-pop-form textarea:focus { outline: 3px solid var(--sun); outline-offset: 0; }
                .cb-pop-form input:disabled, .cb-pop-form textarea:disabled { opacity: 0.65; }
                .cb-pop-submit {
                    margin-top: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
                    background: var(--ink); color: white; border: none; border-radius: 4px; padding: 14px; cursor: pointer;
                    font-family: inherit; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; transition: background 0.2s ease, color 0.2s ease;
                }
                .cb-pop-submit:hover:not(:disabled) { background: white; color: var(--red); }
                .cb-pop-submit:disabled { opacity: 0.75; cursor: wait; }

                .cb-pop-art { position: relative; height: 460px; margin-left: -60px; align-self: center; z-index: 1; }
                .cb-pop-panel {
                    position: absolute; top: -40px; right: 0; width: 290px; height: 400px; border-radius: 4px;
                    background: #A22E1E; border: 1px solid rgba(232,57,29,0.35);
                    background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 18px 18px;
                    box-shadow: 0 30px 70px rgba(0,0,0,0.35);
                }
                .cb-pop-close {
                    position: absolute; top: 6px; right: 6px; width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
                    background: transparent; color: white; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease;
                }
                .cb-pop-close:hover { background: var(--red); }
                .cb-pop-img { position: absolute; left: 0; bottom: 0; width: 100%; height: 100%; object-fit: contain; object-position: bottom center; z-index: 2; filter: drop-shadow(0 20px 30px rgba(0,0,0,0.35)); }
                .cb-pop-art .cb-ph.cb-pop-img { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); width: 80%; left: 10%; height: 80%; border-radius: 12px; }

                @media (min-width: 1800px) {
                    .cb-pop { grid-template-columns: auto 400px 460px; }
                    .cb-pop-h { width: 440px; font-size: 28px; }
                    .cb-pop-h span { font-size: 25px; }
                    .cb-pop-art { height: 560px; }
                    .cb-pop-panel { width: 350px; height: 490px; }
                    .cb-pop-form input, .cb-pop-form textarea { font-size: 15px; padding: 14px 12px; }
                }
                @media (max-height: 640px) {
                    .cb-pop-art { height: 380px; }
                    .cb-pop-panel { height: 330px; }
                    .cb-pop-form textarea { min-height: 60px; height: 60px; }
                }
                /* Popup is web-only */
                @media (max-width: 1023px) { .cb-pop-backdrop { display: none; } }

                /* ══════════════════════════════════════════
                   1800px+ — Full HD / 4K
                ══════════════════════════════════════════ */
                @media (min-width: 1800px) {
                    .cb-inner, .cb-band-inner { max-width: 1640px; padding: 0 120px; }
                    .cb-header-inner { max-width: 1760px; }
                    .cb-footer-inner, .cb-footer-bottom { max-width: 1640px; padding-left: 120px; padding-right: 120px; }
                    .cb-hero { padding: 220px 0 200px; }
                    .cb-hero-h1 { font-size: clamp(4.5rem, 4.6vw, 7rem); }
                    .cb-hero-sub { font-size: 1.2rem; max-width: 640px; }
                    .cb-agency, .cb-portfolio, .cb-why, .cb-process, .cb-testimonials, .cb-final { padding: 160px 0; }
                    .cb-h2 { font-size: clamp(3rem, 3.2vw, 4.4rem); }
                    .cb-sub, .cb-agency-body, .cb-why-desc, .cb-step p, .cb-tp-text { font-size: 17px; }
                    .cb-why-card, .cb-step, .cb-tp-card { padding: 36px; }
                    .cb-btn { font-size: 14px; padding: 18px 36px; }
                    .cb-hero-kid.left { width: 210px; height: 260px; }
                    .cb-hero-kid.right { width: 230px; height: 280px; }
                }

                /* ══════════════════════════════════════════
                   ≤1280px — Laptop
                ══════════════════════════════════════════ */
                @media (max-width: 1280px) {
                    .cb-hero-kid { display: none; }
                }

                /* ══════════════════════════════════════════
                   ≤1100px — Small Laptop
                ══════════════════════════════════════════ */
                @media (max-width: 1100px) {
                    .cb-inner, .cb-band-inner { padding: 0 40px; }
                    .cb-footer-inner { padding: 72px 40px 48px; grid-template-columns: 1fr 1fr; }
                    .cb-footer-inner > :last-child { grid-column: 1 / -1; }
                    .cb-footer-bottom { padding: 24px 40px; }
                    .cb-hero-grid { gap: 40px; }
                    .cb-agency-grid, .cb-process-grid { gap: 52px; }
                    .cb-gallery { grid-template-columns: repeat(3, 1fr); }
                    .cb-why-grid { grid-template-columns: repeat(2, 1fr); }
                    .cb-final-grid { grid-template-columns: 1fr; }
                    .cb-final-img { display: none; }
                }

                /* ══════════════════════════════════════════
                   ≤900px — Tablet
                ══════════════════════════════════════════ */
                @media (max-width: 900px) {
                    .cb-hero { padding: 140px 0 140px; }
                    .cb-hero-grid { grid-template-columns: 1fr; }
                    .cb-hero-copy { text-align: center; }
                    .cb-hero-copy .cb-eyebrow { justify-content: center; }
                    .cb-hero-sub { margin-left: auto; margin-right: auto; }
                    .cb-hero-copy .cb-actions, .cb-hero-perks { justify-content: center; }
                    .cb-form-card { max-width: 560px; width: 100%; margin: 0 auto; }
                    .cb-agency, .cb-portfolio, .cb-why, .cb-process, .cb-testimonials, .cb-final { padding: 88px 0; }
                    .cb-agency-grid { grid-template-columns: 1fr; }
                    .cb-agency-img { max-width: 520px; margin: 0 auto; width: 100%; }
                    .cb-band-inner { grid-template-columns: 1fr; text-align: center; min-height: 0; }
                    .cb-band-content { padding: 64px 0 24px; }
                    .cb-band-line { margin-left: auto; margin-right: auto; }
                    .cb-band-row, .cb-band-row .cb-actions { justify-content: center; }
                    .cb-band-img { height: 240px; }
                    .cb-process-grid { grid-template-columns: 1fr; }
                    .cb-process-left { position: static; text-align: center; }
                    .cb-process-left .cb-eyebrow { justify-content: center; }
                    .cb-process-left .cb-sub { margin-left: auto; margin-right: auto; }
                    .cb-process-img { margin: 32px auto 0; max-width: 320px; }
                    .cb-wave { height: 60px; }
                }

                /* ══════════════════════════════════════════
                   ≤640px — Mobile
                ══════════════════════════════════════════ */
                @media (max-width: 640px) {
                    .cb-inner, .cb-band-inner { padding: 0 20px; }
                    .cb-header-inner { padding: 0 20px; }
                    .cb-header-phone-text { display: none; }
                    .cb-header-right { gap: 10px; }
                    .cb-hero { padding: 120px 0 110px; }
                    .cb-hero-h1 { font-size: clamp(2rem, 9vw, 2.8rem); }
                    .cb-hero-sub { font-size: 0.9rem; }
                    .cb-hero-perks { gap: 14px; }
                    .cb-form-card { padding: 32px 22px 26px; border-radius: 28px 28px 28px 10px; }
                    .cb-form-card::before { display: none; }
                    .cb-form-title { font-size: 17px; }
                    .cb-actions { flex-direction: column; align-items: stretch; width: 100%; }
                    .cb-actions .cb-btn { width: 100%; }
                    .cb-h2 { font-size: clamp(1.6rem, 7vw, 2.2rem); }
                    .cb-section-head { margin-bottom: 36px; }
                    .cb-agency, .cb-portfolio, .cb-why, .cb-process, .cb-testimonials, .cb-final { padding: 64px 0; }
                    .cb-feature-grid { grid-template-columns: 1fr; gap: 16px; }
                    .cb-band-line { font-size: 15px; }
                    .cb-band-img { height: 200px; }
                    .cb-tabs { flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start; margin: 0 -20px 32px; padding: 0 20px 6px; scrollbar-width: none; }
                    .cb-tabs::-webkit-scrollbar { display: none; }
                    .cb-tab { white-space: nowrap; flex-shrink: 0; }
                    .cb-gallery { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                    .cb-gallery-item { border-radius: 12px; }
                    .cb-why-grid { grid-template-columns: 1fr; gap: 16px; }
                    .cb-why-card { padding: 24px; }
                    .cb-step { grid-template-columns: 1fr; gap: 10px; padding: 22px; }
                    .cb-step-num { font-size: 34px; }
                    .cb-tp-card { padding: 20px; }
                    .cb-tp-summary { padding: 16px; margin-bottom: 32px; }
                    .cb-tp-label { font-size: 18px; }
                    .cb-logo-img { height: 42px; }
                    .cb-tp-text { font-size: 14px; }
                    .cb-footer-inner { grid-template-columns: 1fr; padding: 56px 20px 36px; gap: 40px; }
                    .cb-footer-row { grid-template-columns: 1fr; }
                    .cb-footer-bottom { padding: 20px; flex-direction: column; text-align: center; align-items: center; }
                    .cb-wave { height: 40px; }
                }

                /* ══════════════════════════════════════════
                   ≤380px — Small Mobile
                ══════════════════════════════════════════ */
                @media (max-width: 380px) {
                    .cb-inner, .cb-band-inner, .cb-header-inner { padding: 0 14px; }
                    .cb-hero-h1 { font-size: 1.75rem; }
                    .cb-h2 { font-size: 1.45rem; }
                    .cb-logo-img { height: 36px; }
                    .cb-gallery { grid-template-columns: 1fr 1fr; gap: 8px; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cb-main *, .cb-main *::before, .cb-main *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
                }
            `}</style>

            <main id="top" className="cb-main">
                <Header />

                {/* ═══ SECTION 1: HERO ═══ */}
                <section className="cb-hero">
                    <div className="cb-hero-dots" />
                    <div className="cb-hero-glow" />
                    <motion.span className="cb-float f1" animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.span className="cb-float f2" animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.span className="cb-float f3" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
                    <motion.span className="cb-float f4" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />

                    <motion.div className="cb-hero-kid left" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.8, ease: smoothEase }}>
                        <Img src={IMG.heroLeft} alt="" />
                    </motion.div>
                    <motion.div className="cb-hero-kid right" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 1, ease: smoothEase }}>
                        <Img src={IMG.heroRight} alt="" />
                    </motion.div>

                    <div className="cb-inner">
                        <div className="cb-hero-grid">
                            <div className="cb-hero-copy">
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                                    <Eyebrow>Children's Book Illustration</Eyebrow>
                                </motion.div>
                                <motion.h1 variants={maskReveal} initial="hidden" animate="visible" className="cb-hero-h1">
                                    Custom Book{" "}
                                    <span className="scribble">
                                        Illustration
                                        <svg viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
                                            <path d="M2 12 C60 2, 120 16, 180 7 S270 4, 298 10" stroke="#ffc83d" strokeWidth="5" fill="none" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <span className="accent">Services</span>
                                </motion.h1>
                                <motion.p variants={fadeUp} initial="hidden" animate="visible" className="cb-hero-sub">
                                    Our illustrators create bright, eye-catching artwork that brings your characters to life and makes readers of every age fall in love with your story.
                                </motion.p>
                                <motion.div variants={fadeUp} initial="hidden" animate="visible"><ActionButtons /></motion.div>
                                <motion.div className="cb-hero-perks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                                    <span className="cb-hero-perk"><Sparkles size={16} /> Unlimited revisions</span>
                                    <span className="cb-hero-perk"><Timer size={16} /> First draft in 4–7 days</span>
                                    <span className="cb-hero-perk"><ShieldCheck size={16} /> 100% ownership</span>
                                </motion.div>
                            </div>
                            <LeadForm />
                        </div>
                    </div>
                    <Wave fill="#faf9f7" />
                </section>

                {/* ═══ SECTION 2: BOOK ILLUSTRATION AGENCY ═══ */}
                <section className="cb-agency" ref={agencyRef}>
                    <div className="cb-inner">
                        <div className="cb-agency-grid">
                            <motion.div
                                className="cb-agency-img"
                                initial={{ clipPath: "inset(100% 0% 0% 0% round 24px)" }}
                                animate={agencyInView ? { clipPath: "inset(0% 0% 0% 0% round 24px)" } : {}}
                                transition={{ duration: 1.4, ease: smoothEase }}
                            >
                                <span className="cb-agency-blob" />
                                <Img src={IMG.agency} alt="Illustrated children's books" />
                            </motion.div>

                            <motion.div variants={staggerContainer} initial="hidden" animate={agencyInView ? "visible" : "hidden"}>
                                <motion.div variants={fadeUp}><Eyebrow>Who We Are</Eyebrow></motion.div>
                                <motion.h2 variants={maskReveal} className="cb-h2">
                                    BOOK ILLUSTRATION <span className="accent">AGENCY</span>
                                </motion.h2>
                                <motion.p variants={fadeUp} className="cb-agency-body">
                                    Illustrating a book is harder than it looks. Picture books need characters children remember, colors that hold their attention, and pages that move the story forward. Our experienced illustrators create artwork that readers of all ages love and that helps your book stand out on the shelf.
                                </motion.p>
                                <motion.div variants={staggerContainer} className="cb-feature-grid">
                                    {agencyFeatures.map(({ icon: Icon, title }) => (
                                        <motion.div key={title} variants={fadeUp} className="cb-feature">
                                            <div className="cb-feature-icon"><Icon size={20} /></div>
                                            <p>{title}</p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 3: CTA BAND ═══ */}
                <CtaBand line="Share your ideas with us and get illustrations that bring your story to life." image={IMG.cta1} imageAlt="Girl reading a picture book" />

                {/* ═══ SECTION 4: PORTFOLIO ═══ */}
                <Portfolio />

                {/* ═══ SECTION 5: WHY CHOOSE US ═══ */}
                <section className="cb-why">
                    <div className="cb-inner">
                        <div className="cb-section-head center">
                            <Eyebrow center>Why Bexley</Eyebrow>
                            <motion.h2 variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="cb-h2">
                                WHY OPT FOR OUR <span className="accent">BOOK ILLUSTRATION SERVICES?</span>
                            </motion.h2>
                            <p className="cb-sub">Our illustrators work closely with you and follow your guidelines at every step. Here are a few reasons authors trust us with their books.</p>
                        </div>
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="cb-why-grid">
                            {whyCards.map(({ icon: Icon, title, desc }) => (
                                <motion.div key={title} variants={fadeUp} className="cb-why-card">
                                    <div className="cb-why-top">
                                        <div className="cb-why-icon"><Icon size={24} /></div>
                                        <h3 className="cb-why-title">{title}</h3>
                                    </div>
                                    <p className="cb-why-desc">{desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ═══ SECTION 6: CTA BAND 2 ═══ */}
                <CtaBand line="Share your ideas with us for best-in-class book illustrations." image={IMG.cta2} imageAlt="Boy standing beside a stack of books" />

                {/* ═══ SECTION 7: PROCESS ═══ */}
                <section id="process" className="cb-process">
                    <div className="cb-process-dots" />
                    <div className="cb-inner">
                        <div className="cb-process-grid">
                            <div className="cb-process-left">
                                <Eyebrow>How It Works</Eyebrow>
                                <motion.h2 variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="cb-h2 light">
                                    BOOK ILLUSTRATION <span className="accent">PROCESS</span>
                                </motion.h2>
                                <p className="cb-sub">This is how we create outstanding illustrations, from your first idea to print-ready pages.</p>
                                <motion.div className="cb-process-img" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: smoothEase }}>
                                    <Img src={IMG.process} alt="Illustrated girl character" />
                                </motion.div>
                            </div>

                            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="cb-steps">
                                {processSteps.map(({ step, title, desc }) => (
                                    <motion.div key={step} variants={fadeUp} className="cb-step">
                                        <div className="cb-step-num">{step}<small>STEP</small></div>
                                        <div><h3>{title}</h3><p>{desc}</p></div>
                                    </motion.div>
                                ))}
                                <motion.div variants={fadeUp}>
                                    <button type="button" className="cb-btn cb-btn-primary" onClick={getStarted}>Order Now <ArrowRight size={16} /></button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 8: TESTIMONIALS ═══ */}
                <Testimonials />

                {/* ═══ SECTION 9: FINAL CTA ═══ */}
                <section className="cb-final">
                    <div className="cb-inner">
                        <div className="cb-final-grid">
                            <motion.div className="cb-final-img" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: smoothEase }}>
                                <Img src={IMG.finalLeft} alt="Child drawing" />
                            </motion.div>
                            <div className="cb-final-center">
                                <Eyebrow center>Start Today</Eyebrow>
                                <motion.h2 variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="cb-h2">
                                    GET YOUR BOOK ILLUSTRATED <span className="accent">BY OUR EXPERTS</span>
                                </motion.h2>
                                <p className="cb-sub">Work with our illustrators today and get artwork your readers will remember.</p>
                                <ActionButtons dark />
                            </div>
                            <motion.div className="cb-final-img" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: smoothEase }}>
                                <Img src={IMG.finalRight} alt="Illustrated girl character" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                <Footer />
                <GetStartedPopup />
            </main>
        </>
    );
}
