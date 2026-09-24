import type { Metadata } from "next";
import ChildLandingPage from "@/components/pages/landing/ChildLandingPage";

export const metadata: Metadata = {
    title: { absolute: "Children's Book Illustration Services | Bexley Publishing" },
    description:
        "Custom children's book illustrations with unlimited revisions, first sketches in 4–7 days and 100% ownership. Get up to 50% off with Bexley Publishing.",
    openGraph: {
        title: "Children's Book Illustration Services | Bexley Publishing",
        description: "Bright, memorable illustrations for picture books. Unlimited revisions, fast turnaround, 100% ownership.",
        type: "website",
    },
};

export default function ChildrensBookPage() {
    return <ChildLandingPage />;
}
