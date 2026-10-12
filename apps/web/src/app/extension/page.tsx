import type { Metadata } from "next";
import { ExtensionSetup } from "@/components/extension/extension-setup";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata: Metadata = { title: "Extension" };

export default function ExtensionPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle as="h1" title="Get the extension" />
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The logiQ side panel reads the problem you are on, writes the solution, explains every
          line and saves it to your vault.
        </p>
      </div>
      <ExtensionSetup />
    </div>
  );
}
