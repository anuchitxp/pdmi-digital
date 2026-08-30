import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const variants = {
  warning: { icon: AlertTriangle, classes: "bg-red-50 border-red-200 text-red-800" },
  success: { icon: CheckCircle2, classes: "bg-green-50 border-green-200 text-green-800" },
} as const;

export default function AlertBanner({
  variant,
  children,
  icon: IconOverride,
}: {
  variant: keyof typeof variants;
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  const { icon: DefaultIcon, classes } = variants[variant];
  const Icon = IconOverride ?? DefaultIcon;
  return (
    <div
      role={variant === "warning" ? "alert" : "status"}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${classes}`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}
