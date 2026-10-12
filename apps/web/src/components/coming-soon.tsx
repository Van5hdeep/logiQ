import { Card } from "./ui/card";
import { SectionTitle } from "./ui/section-title";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle as="h1" title={title} />
        <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>
      </div>
      <Card dashed className="p-12 text-center text-sm text-muted">
        Coming soon. This page is a placeholder so the navigation works.
      </Card>
    </div>
  );
}
