import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { SITE } from "@/components/site";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function Page() {
    return (
        <LegalPage title="Terms & Conditions" updated="[Add date]">
            <p className="lg-note">Placeholder layout. Replace these sections with your official Terms & Conditions text from your main website or your legal advisor.</p>
            <h2>1. Agreement to Terms</h2>
            <p>[Your text here]</p>
            <h2>2. Services</h2>
            <p>[Your text here]</p>
            <h2>3. Payments</h2>
            <p>[Your text here]</p>
            <h2>4. Ownership & Intellectual Property</h2>
            <p>[Your text here]</p>
            <h2>5. Limitation of Liability</h2>
            <p>[Your text here]</p>
            <h2>Contact Us</h2>
            <p>
                Questions about this policy? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, call{" "}
                <a href={SITE.phoneHref}>{SITE.phone}</a>, or write to us at {SITE.address}.
            </p>
        </LegalPage>
    );
}
