import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { SITE } from "@/components/site";

export const metadata: Metadata = { title: "Refund Policy" };

export default function Page() {
    return (
        <LegalPage title="Refund Policy" updated="[Add date]">
            <p className="lg-note">Placeholder layout. Replace these sections with your official Refund Policy text from your main website or your legal advisor.</p>
            <h2>1. Eligibility for Refunds</h2>
            <p>[Your text here]</p>
            <h2>2. Non-Refundable Situations</h2>
            <p>[Your text here]</p>
            <h2>3. How to Request a Refund</h2>
            <p>[Your text here]</p>
            <h2>4. Processing Time</h2>
            <p>[Your text here]</p>
            <h2>Contact Us</h2>
            <p>
                Questions about this policy? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, call{" "}
                <a href={SITE.phoneHref}>{SITE.phone}</a>, or write to us at {SITE.address}.
            </p>
        </LegalPage>
    );
}
