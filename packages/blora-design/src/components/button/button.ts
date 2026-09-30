/**
 * Blora Design 2.0 - Button helpers
 *
 * Spec §17.1: CSS does not depend on this helper.
 * The helper is optional convenience for loading state management
 * and Lucide icon hydration on native `.blora-button[data-icon]`.
 */

import { createBloraIcon, isBloraIconName } from "../../core/icons.js";

export interface ButtonLoadingOptions {
  /** Accessible label during loading (e.g. "保存中"). */
  label?: string;
  /** Whether to also set `disabled` during loading. Default: true. */
  disable?: boolean;
}

/**
 * Toggle a button's loading state.
 *
 * - Sets `aria-busy` and `data-loading` on the button.
 * - When `disable` is true (default), also sets `disabled` to prevent
 *   accidental submit during async operations.
 * - When `label` is provided, temporarily swaps the button's text content
 *   and restores the original on `false`.
 */
export function setButtonLoading(
  button: HTMLButtonElement,
  loading: boolean,
  options: ButtonLoadingOptions = {},
): void {
  const { label, disable = true } = options;

  if (loading) {
    button.setAttribute("aria-busy", "true");
    button.setAttribute("data-loading", "");

    if (disable) {
      button.disabled = true;
    }

    if (label !== undefined) {
      const original = button.dataset.loadingLabel;
      if (original === undefined) {
        button.dataset.loadingLabel = button.textContent ?? "";
      }
      button.textContent = label;
    }
  } else {
    button.removeAttribute("aria-busy");
    button.removeAttribute("data-loading");

    if (disable) {
      button.disabled = false;
    }

    if (label !== undefined || button.dataset.loadingLabel !== undefined) {
      const original = button.dataset.loadingLabel;
      if (original !== undefined) {
        button.textContent = original;
        delete button.dataset.loadingLabel;
      }
    }
  }
}

/**
 * Hydrate `.blora-button[data-icon]` with `createBloraIcon()`.
 * Safe to call more than once — existing injected icons are left alone.
 */
export function enhanceButtons(root: ParentNode = document): void {
  if (typeof document === "undefined") return;
  const buttons = [...root.querySelectorAll<HTMLElement>(".blora-button[data-icon]")];
  if (root instanceof HTMLElement && root.matches(".blora-button[data-icon]"))
    buttons.unshift(root);
  buttons.forEach((button) => {
    const name = button.getAttribute("data-icon");
    if (!name || !isBloraIconName(name)) return;
    if (button.querySelector(":scope > svg[data-blora-icon]")) return;
    const icon = createBloraIcon(name, 16, button.ownerDocument);
    icon.dataset.bloraIcon = name;
    if (button.getAttribute("data-icon-position") === "end") button.append(icon);
    else button.prepend(icon);
  });
}
