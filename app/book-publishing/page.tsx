import type { Metadata } from "next";
import PublishingLandingPage from "@/components/pages/landing/PublishingLandingPage";

export const metadata: Metadata = {
    title: { absolute: "Professional Book Publishing Services | Bexley Publishing" },
    description:
        "Publish your book with Bexley Publishing. Editing, cover design, formatting, global distribution and marketing — keep 100% of your rights and royalties. Get up to 50% off.",
    openGraph: {
        title: "Professional Book Publishing Services | Bexley Publishing",
        description: "Editing, design, formatting, distribution and marketing under one roof. Keep 100% of your royalties.",
        type: "website",
    },
};

export default function BookPublishingPage() {
    return <PublishingLandingPage />;
}
