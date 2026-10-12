import { ChartColumn, Cpu, Repeat, Settings, Shapes, Vault } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Vault", icon: Vault },
  { href: "/patterns", label: "Patterns", icon: Shapes },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/stats", label: "Stats", icon: ChartColumn },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
