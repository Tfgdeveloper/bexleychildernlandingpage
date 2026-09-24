import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { SITE } from "@/components/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
    return (
        <LegalPage title="Privacy Policy" updated="[Add date]">
            <p className="lg-note">Placeholder layout. Replace these sections with your official Privacy Policy text from your main website or your legal advisor.</p>
            <h2>1. Information We Collect</h2>
            <p>[Your text here — e.g. name, email, phone number and project details submitted through our forms]</p>
            <h2>2. How We Use Your Information</h2>
            <p>[Your text here]</p>
            <h2>3. Sharing Your Information</h2>
            <p>[Your text here]</p>
            <h2>4. Cookies</h2>
            <p>[Your text here]</p>
            <h2>5. Your Rights</h2>
            <p>[Your text here]</p>
            <h2>Contact Us</h2>
            <p>
                Questions about this policy? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, call{" "}
                <a href={SITE.phoneHref}>{SITE.phone}</a>, or write to us at {SITE.address}.
            </p>
        </LegalPage>
    );
}
