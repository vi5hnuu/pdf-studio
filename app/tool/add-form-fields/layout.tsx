import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add Form Fields to PDF — PDF Studio",
    description: "Add editable text fields and checkboxes to any PDF file. Create interactive forms from existing PDFs, free and online.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
