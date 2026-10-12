"use client";

import { useEffect, useState } from "react";
import { Check, Download } from "lucide-react";
import { extensionVersion } from "@/lib/extension-client";
import { Card } from "../ui/card";
import { Pill } from "../ui/pill";

const STEPS = [
  { title: "Download", body: "Click Download extension and unzip logiq-extension.zip into a folder you'll keep, e.g. Documents\\logiQ-extension." },
  { title: "Open extensions", body: "In Chrome go to chrome://extensions and switch on Developer mode (top right)." },
  { title: "Load it", body: "Click Load unpacked and choose the unzipped folder (the one with manifest.json)." },
  { title: "Pin it", body: "Pin logiQ from the puzzle icon. Open any problem and press Alt+L or click the icon." },
];

export function ExtensionSetup() {
  const [version, setVersion] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    const check = () =>
      extensionVersion().then((v) => {
        if (alive) setVersion(v);
      });
    void check();
    const timer = setInterval(check, 4000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Card tone={version ? "mint" : "white"} accent="rainbow" className="flex flex-wrap items-center justify-between gap-4 pt-6">
        <div>
          <p className="text-lg font-semibold">
            {version ? "Extension installed" : version === null ? "Extension not detected" : "Checking…"}
          </p>
          <p className="text-sm text-muted">
            {version
              ? `Version ${version}. You're all set.`
              : "Chrome only installs extensions directly from the Chrome Web Store, so logiQ is installed once by hand (about a minute)."}
          </p>
        </div>
        {version ? (
          <Pill tone="white" icon={<Check size={13} aria-hidden="true" />}>
            Connected
          </Pill>
        ) : (
          <a
            href="/api/extension/download"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            <Download size={16} aria-hidden="true" />
            Download extension
          </a>
        )}
      </Card>

      <ol className="grid gap-3 md:grid-cols-2">
        {STEPS.map((step, i) => (
          <Card key={step.title} as="li" className="pt-6">
            <p className="text-xs font-medium text-muted">Step {i + 1}</p>
            <p className="mt-1 font-semibold">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{step.body}</p>
          </Card>
        ))}
      </ol>
    </div>
  );
}
