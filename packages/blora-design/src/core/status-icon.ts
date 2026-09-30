import { createBloraIcon, type BloraIconName } from "./icons.js";

export type StatusIconVariant = "danger" | "error" | "info" | "success" | "warning";

/* One circled family for every status so Alert, Result, Message and
   Notification variants read as siblings (bare check/x next to circled
   alert/info looked like two icon sets). */
const STATUS_ICON: Record<StatusIconVariant, BloraIconName> = {
  success: "circle-check",
  danger: "circle-x",
  error: "circle-x",
  warning: "circle-alert",
  info: "info",
};

/** Status glyphs share the Lucide factory so Alert/Result/Message stay on one set. */
export function createStatusIcon(
  doc: Document,
  variant: StatusIconVariant,
  size: number,
): SVGSVGElement {
  return createBloraIcon(STATUS_ICON[variant] ?? "info", size, doc);
}
