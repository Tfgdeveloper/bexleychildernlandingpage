"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const PHONE_NUMBER = "+1234567890"; // replace with your real number

const css = `
body {
    padding-bottom: 64px;
}

.pb-callbar-wrapper {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 9999;
    margin: 0;
}

.pb-callbar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    min-height: 60px;
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    color: #fff;
    font-weight: 700;
    font-size: 18px;
    line-height: 1.2;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    color: var(--cream, #faf9f7);
    background-color: var(--red, #e8391d);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
    animation: pb-callbar-cycle 10s ease-in-out infinite;
    transition: filter 0.2s ease;
}

.pb-callbar:hover {
    filter: brightness(1.1);
}

.pb-callbar:visited,
.pb-callbar:hover,
.pb-callbar:focus {
    color: var(--cream, #faf9f7);
    text-decoration: none;
}

.pb-callbar-icon {
    display: inline-flex;
    animation: pb-callbar-ring 1.6s ease-in-out infinite;
}

.pb-callbar.is-blinking {
    animation: pb-callbar-blink 0.75s steps(1, end) 1;
}

@keyframes pb-callbar-cycle {
    0%   { background-color: var(--red, #e8391d); }
    33%  { background-color: var(--red-dark, #c0271a); }
    66%  { background-color: var(--ink, #05070f); }
    100% { background-color: var(--red, #e8391d); }
}

@keyframes pb-callbar-blink {
    0%   { background-color: var(--red, #e8391d); }
    16%  { background-color: var(--ink, #05070f); }
    33%  { background-color: var(--red-dark, #c0271a); }
    50%  { background-color: var(--red, #e8391d); }
    66%  { background-color: var(--ink, #05070f); }
    83%  { background-color: var(--red-dark, #c0271a); }
    100% { background-color: var(--red, #e8391d); }
}

@keyframes pb-callbar-ring {
    0%, 60%, 100% { transform: rotate(0); }
    10%, 30%      { transform: rotate(-15deg); }
    20%, 40%      { transform: rotate(15deg); }
}

@media (max-width: 600px) {
    body { padding-bottom: 56px; }
    .pb-callbar { font-size: 16px; min-height: 54px; padding: 14px 12px; }
}

@media (prefers-reduced-motion: reduce) {
    .pb-callbar,
    .pb-callbar-icon,
    .pb-callbar.is-blinking {
        animation: none;
    }
}
`;

export default function CallBar() {
    const [mounted, setMounted] = useState(false);
    const [blinking, setBlinking] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (blinking) return;
        setBlinking(true);
        setTimeout(() => {
            window.location.href = `tel:${PHONE_NUMBER}`;
        }, 750);
    };

    if (!mounted) return null;

    return createPortal(
        <>
            <style>{css}</style>
            <div className="pb-callbar-wrapper">
                <a
                    href={`tel:${PHONE_NUMBER}`}
                    className={`pb-callbar ${blinking ? "is-blinking" : ""}`}
                    onClick={handleClick}
                    onAnimationEnd={(e) => {
                        if (e.animationName === "pb-callbar-blink") setBlinking(false);
                    }}
                    aria-label={`Call us at ${PHONE_NUMBER}`}
                >
                    <span className="pb-callbar-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
                        </svg>
                    </span>
                    <span>Ready? Click to Call</span>
                </a>
            </div>
        </>,
        document.body
    );
}