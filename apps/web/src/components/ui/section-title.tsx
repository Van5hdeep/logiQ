/**
 * Heading with the small superscript count used across the UI: "Review today ³".
 * h1 = page title (large, like "My Learning Plan"); h2/h3 = card and rail titles.
 */
export function SectionTitle({
  title,
  count,
  as: Heading = "h2",
}: {
  title: string;
  count?: number;
  as?: "h1" | "h2" | "h3";
}) {
  const page = Heading === "h1";
  return (
    <Heading
      className={
        page
          ? "text-4xl font-semibold tracking-tight md:text-[44px] md:leading-[1.1]"
          : "text-xl font-semibold tracking-tight"
      }
    >
      {title}
      {count !== undefined && (
        <sup className={`ml-1.5 align-super font-medium text-muted ${page ? "text-lg" : "text-sm"}`}>
          {count}
        </sup>
      )}
    </Heading>
  );
}
