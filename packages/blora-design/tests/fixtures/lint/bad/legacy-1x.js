// legacy-1x + shadow-access: Blora 1.x APIs and shadow DOM reach-in.
import { Blora } from "somewhere";

Blora.init();
Blora.configure({});
Blora.applyColorMode("dark");

export function setup(el) {
  const root = el.shadowRoot;
  return root;
}
