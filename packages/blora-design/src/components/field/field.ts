/**
 * Blora Design 2.0 - Field controller
 * v1 text-limit: overflow characters highlighted red via mirror layer.
 */
import { BloraElement } from "../../core/blora-element.js";

export const BLORA_FIELD_TAG = "blora-field";

const FORWARDED_NATIVE_ATTRIBUTES = [
  "autocomplete",
  "inputmode",
  "aria-label",
  "autocapitalize",
  "spellcheck",
  "enterkeyhint",
] as const;

let fieldId = 0;
export interface FieldController {
  destroy(): void;
}

export function createFieldController(root: HTMLElement): FieldController {
  const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    "[data-limit], [data-blora-limit]",
  );
  const cleanupFns: (() => void)[] = [];

  const splitValue = (value: string, limit: number) => {
    const chars = Array.from(value || "");
    return {
      count: chars.length,
      normal: chars.slice(0, limit).join(""),
      overflow: chars.slice(limit).join(""),
    };
  };

  inputs.forEach((field) => {
    const limit = Number(field.dataset.limit ?? field.dataset.bloraLimit ?? 0);
    if (!Number.isFinite(limit) || limit < 1) return;

    field.removeAttribute("maxlength");
    let wrapper = field.closest<HTMLElement>(".blora-limit");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "blora-limit";
      field.parentNode?.insertBefore(wrapper, field);
      wrapper.appendChild(field);
    }
    wrapper.classList.toggle("blora-limit--textarea", field.tagName === "TEXTAREA");

    let mirror = wrapper.querySelector<HTMLElement>(".blora-limit__mirror");
    let normal: HTMLElement;
    let overflow: HTMLElement;
    let counter: HTMLElement;

    if (!mirror) {
      mirror = document.createElement("div");
      mirror.className = "blora-limit__mirror";
      mirror.setAttribute("aria-hidden", "true");
      const mirrorInner = document.createElement("span");
      mirrorInner.className = "blora-limit__mirror-inner";
      normal = document.createElement("span");
      overflow = document.createElement("span");
      overflow.className = "blora-limit__overflow";
      mirrorInner.append(normal, overflow);
      mirror.appendChild(mirrorInner);
      counter = document.createElement("span");
      counter.className = "blora-limit__count";
      counter.setAttribute("aria-live", "polite");
      wrapper.append(mirror, counter);
    } else {
      normal = mirror.querySelector(
        ".blora-limit__mirror-inner > span:not(.blora-limit__overflow)",
      )!;
      overflow = mirror.querySelector(".blora-limit__overflow")!;
      counter = wrapper.querySelector(".blora-limit__count")!;
    }

    const syncScroll = () => {
      const inner = mirror!.querySelector<HTMLElement>(".blora-limit__mirror-inner");
      if (inner) inner.style.transform = `translateX(${-field.scrollLeft}px)`;
      mirror!.scrollTop = field.scrollTop;
    };

    const update = () => {
      const state = splitValue(field.value, limit);
      const over = state.count > limit;
      normal.textContent = state.normal || "";
      overflow.textContent = state.overflow || "";
      counter.textContent = `${state.count}/${limit}`;
      if (over) wrapper!.setAttribute("data-over-limit", "");
      else wrapper!.removeAttribute("data-over-limit");
      if (over) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
      syncScroll();
    };

    field.addEventListener("input", update);
    field.addEventListener("scroll", syncScroll);
    update();
    cleanupFns.push(() => {
      field.removeEventListener("input", update);
      field.removeEventListener("scroll", syncScroll);
    });
  });

  return {
    destroy() {
      cleanupFns.forEach((fn) => fn());
    },
  };
}

/** Form field CE that owns label, native control and feedback structure. */
export class BloraField extends BloraElement {
  private controller: FieldController | null = null;
  private reflecting = false;
  private readonly controlId = `blora-field-${++fieldId}`;
  /** True when the author supplied the native input/textarea as a child. */
  private adopted = false;
  /** Control attributes currently written from host attributes. */
  private readonly managed = new Set<string>();

  /**
   * An authored `<input>` / `<textarea>` child is adopted instead of being
   * replaced, so attributes written on it (type="password", name,
   * autocomplete, maxlength …) survive. Host attributes still win when set.
   */
  private authoredControl(): HTMLInputElement | HTMLTextAreaElement | null {
    for (const child of Array.from(this.children)) {
      if (child instanceof HTMLTextAreaElement) return child;
      if (child instanceof HTMLInputElement && child.type !== "hidden") return child;
    }
    return null;
  }

  /**
   * Write host-driven attributes onto the control. Generated controls mirror
   * the host exactly (previous behaviour); adopted controls only lose an
   * attribute when the host itself had set it earlier.
   */
  private applyControlAttributes(control: HTMLInputElement | HTMLTextAreaElement): void {
    const clearable = (name: string) => !this.adopted || this.managed.has(name);
    const text = (name: string, apply: (value: string) => void, clear: () => void) => {
      const value = this.getAttribute(name);
      if (value !== null) {
        apply(value);
        this.managed.add(name);
      } else if (clearable(name)) {
        clear();
        this.managed.delete(name);
      }
    };
    const flag = (name: string, prop: "required" | "disabled" | "readOnly") => {
      if (this.hasAttribute(name)) {
        control[prop] = true;
        this.managed.add(name);
      } else if (clearable(name)) {
        control[prop] = false;
        this.managed.delete(name);
      }
    };
    if (control instanceof HTMLInputElement) {
      text(
        "type",
        (value) => (control.type = value),
        () => (control.type = "text"),
      );
    }
    text(
      "name",
      (value) => (control.name = value),
      () => (control.name = ""),
    );
    text(
      "placeholder",
      (value) => (control.placeholder = value),
      () => (control.placeholder = ""),
    );
    flag("required", "required");
    flag("disabled", "disabled");
    flag("readonly", "readOnly");
    for (const name of FORWARDED_NATIVE_ATTRIBUTES) {
      text(
        name,
        (value) => control.setAttribute(name, value),
        () => control.removeAttribute(name),
      );
    }
    text(
      "limit",
      (value) => (control.dataset.limit = value),
      () => delete control.dataset.limit,
    );
    text(
      "minlength",
      (value) => (control.minLength = Number(value)),
      () => control.removeAttribute("minlength"),
    );
    text(
      "maxlength",
      (value) => (control.maxLength = Number(value)),
      () => control.removeAttribute("maxlength"),
    );
    if (control instanceof HTMLInputElement) {
      text(
        "pattern",
        (value) => (control.pattern = value),
        () => control.removeAttribute("pattern"),
      );
    }
  }

  static get observedAttributes(): string[] {
    return [
      "label",
      "name",
      "type",
      "value",
      "placeholder",
      "hint",
      "error",
      "state",
      "limit",
      "minlength",
      "maxlength",
      "pattern",
      "validate",
      "textarea",
      "required",
      "disabled",
      "readonly",
      "layout",
      ...FORWARDED_NATIVE_ATTRIBUTES,
    ];
  }

  attributeChangedCallback(): void {
    if (!this.isConnectedInternal || this.reflecting) return;
    const control = this.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    const wantsTextarea = this.hasAttribute("textarea");
    const isTextarea = control instanceof HTMLTextAreaElement;
    /* An adopted control keeps the element type the author chose. */
    if (control && !this.adopted && wantsTextarea !== isTextarea) {
      const current = control.value;
      this.controller?.destroy();
      this.render();
      const next = this.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
      if (next && current) next.value = current;
      this.bindEvents();
      return;
    }
    this.sync();
  }

  get value(): string {
    return (
      this.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea")?.value ?? ""
    );
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  override focus(options?: FocusOptions): void {
    this.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea")?.focus(options);
  }

  protected render(): void {
    const root = this.ownerDocument.createElement("div");
    root.className = "blora-field";
    root.dataset.bloraGenerated = "";
    const state = this.getAttribute("state") ?? (this.hasAttribute("error") ? "invalid" : null);
    const hintText = this.getAttribute("hint") ?? "";
    const errorText = this.getAttribute("error") ?? "";
    const authored = this.authoredControl();
    this.adopted = authored !== null;
    this.managed.clear();
    const id = authored?.id || (this.id ? `${this.id}-control` : this.controlId);
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    if (state === "invalid" || state === "valid") root.dataset.state = state;
    const layout = this.getAttribute("layout");
    if (layout === "horizontal") root.dataset.layout = layout;
    const validate = this.getAttribute("validate");
    if (validate) root.dataset.bloraValidate = validate;

    const control =
      authored ??
      (this.hasAttribute("textarea")
        ? this.ownerDocument.createElement("textarea")
        : this.ownerDocument.createElement("input"));
    control.id = id;
    control.classList.add(
      control instanceof HTMLTextAreaElement ? "blora-textarea" : "blora-input",
    );
    const initialValue = this.getAttribute("value");
    if (initialValue !== null || !authored) control.value = initialValue ?? "";
    this.applyControlAttributes(control);

    const labelText = this.getAttribute("label");
    if (labelText) {
      const label = this.ownerDocument.createElement("label");
      label.className = "blora-field__label";
      label.htmlFor = id;
      label.textContent = labelText;
      if (control.required) label.dataset.required = "";
      root.appendChild(label);
    }

    if (state === "invalid" || errorText) control.setAttribute("aria-invalid", "true");
    const describedBy: string[] = [];
    if (hintText) describedBy.push(hintId);
    if (errorText) describedBy.push(errorId);
    if (describedBy.length) control.setAttribute("aria-describedby", describedBy.join(" "));
    root.appendChild(control);

    if (hintText) {
      const hint = this.ownerDocument.createElement("span");
      hint.id = hintId;
      hint.className = "blora-field__help";
      hint.textContent = hintText;
      root.appendChild(hint);
    }
    const error = this.ownerDocument.createElement("span");
    error.id = errorId;
    error.className = "blora-field__error";
    if (errorText) {
      error.textContent = errorText;
    } else {
      error.hidden = true;
    }
    root.appendChild(error);
    this.replaceChildren(root);
  }

  protected override sync(): void {
    const root = this.querySelector<HTMLElement>(".blora-field");
    const control = root?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    if (!root || !control) return;
    const state = this.getAttribute("state") ?? (this.hasAttribute("error") ? "invalid" : null);
    const hintText = this.getAttribute("hint") ?? "";
    const errorText = this.getAttribute("error") ?? "";
    const id = control.id || (this.id ? `${this.id}-control` : this.controlId);
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    if (state === "invalid" || state === "valid") root.dataset.state = state;
    else delete root.dataset.state;
    const layout = this.getAttribute("layout");
    if (layout === "horizontal") root.dataset.layout = layout;
    else delete root.dataset.layout;
    const validate = this.getAttribute("validate");
    if (validate) root.dataset.bloraValidate = validate;
    else delete root.dataset.bloraValidate;
    if (document.activeElement !== control)
      control.value = this.getAttribute("value") ?? control.value;
    this.applyControlAttributes(control);
    const label = root.querySelector<HTMLLabelElement>(".blora-field__label");
    if (label) {
      label.textContent = this.getAttribute("label") ?? "";
      label.toggleAttribute("data-required", control.required);
    }
    if (state === "invalid" || errorText) control.setAttribute("aria-invalid", "true");
    else control.removeAttribute("aria-invalid");
    const describedBy: string[] = [];
    if (hintText) describedBy.push(hintId);
    if (errorText) describedBy.push(errorId);
    if (describedBy.length) control.setAttribute("aria-describedby", describedBy.join(" "));
    else control.removeAttribute("aria-describedby");
    let hint = root.querySelector<HTMLElement>(".blora-field__help");
    if (hintText) {
      if (!hint) {
        hint = this.ownerDocument.createElement("span");
        hint.id = hintId;
        hint.className = "blora-field__help";
        const errorNode = root.querySelector(".blora-field__error");
        if (errorNode) root.insertBefore(hint, errorNode);
        else root.appendChild(hint);
      }
      hint.textContent = hintText;
      hint.id = hintId;
    } else {
      hint?.remove();
    }
    const error = root.querySelector<HTMLElement>(".blora-field__error");
    if (error) {
      error.id = errorId;
      error.textContent = errorText;
      error.hidden = !errorText;
    }
  }

  protected bindEvents(): void {
    const root = this.querySelector<HTMLElement>(".blora-field");
    const control = root?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    if (!root || !control) return;
    this.controller?.destroy();
    this.controller = createFieldController(root);
    this.listen(control, "input", () => {
      this.reflecting = true;
      this.setAttribute("value", control.value);
      this.reflecting = false;
    });
  }

  protected onDisconnect(): void {
    this.controller?.destroy();
    this.controller = null;
  }
}

export function defineBloraField(registry: CustomElementRegistry = customElements): void {
  if (!registry || registry.get(BLORA_FIELD_TAG)) return;
  registry.define(BLORA_FIELD_TAG, BloraField);
}
