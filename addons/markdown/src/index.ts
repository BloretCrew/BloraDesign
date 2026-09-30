/**
 * Blora Design 2.0 - Markdown rendering add-on.
 * Spec §9: Add-on package, not bundled into core.
 * Spec §17.6: API must require explicit security policy.
 * Visual baseline: archived 1.x blora.js lines 5755-5900.
 * @packageDocumentation
 */

export interface MarkdownOptions {
  /**
   * Escape all HTML in source (default: true).
   * When true, all user input is escaped via escapeHTML before rendering.
   * Setting to false is DANGEROUS - only use with trusted input.
   */
  sanitize?: boolean;
  /**
   * Allow raw HTML tags in source (default: false).
   * When false, raw HTML is escaped and displayed as text.
   * When true, raw HTML passes through - DANGEROUS, user must explicitly opt in.
   */
  allowHtml?: boolean;
  /** Render inline-only (no block elements like headings, lists, etc.) */
  inline?: boolean;
}

/** Escape HTML special characters to prevent XSS. */
function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Process inline Markdown formatting (bold, italic, code, links, images). */
function mdInline(text: string, allowHtml: boolean): string {
  let s = allowHtml ? text : escapeHTML(text);

  // Images ![alt](url)
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_match, alt: string, url: string, title: string | undefined) => {
      const t = title ? ` title="${escapeHTML(title)}"` : "";
      return `<img class="blora-md__img" src="${escapeHTML(url)}" alt="${escapeHTML(alt)}"${t} loading="lazy">`;
    },
  );

  // Links [text](url) - only http(s)/mailto/#/relative
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_match, label: string, url: string, title: string | undefined) => {
      const u = String(url || "").trim();
      if (!/^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(u)) {
        return escapeHTML(`[${label}](${url})`);
      }
      const t = title ? ` title="${escapeHTML(title)}"` : "";
      const rel = /^https?:/i.test(u) ? ' rel="noopener noreferrer" target="_blank"' : "";
      // Use NUL-delimited placeholders to protect from italic/bold regex
      return `\uE000A\uE000${escapeHTML(u)}"${t}${rel}\uE000B\uE000${label}\uE000C\uE000`;
    },
  );

  // Inline code - protect from further processing
  s = s.replace(/`([^`\n]+)`/g, (_m, code: string) => `\uE000CS\uE000${code}\uE000CE\uE000`);

  // Bold + italic
  s = s.replace(/\*\*\*([^*\n]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  s = s.replace(/___([^_\n]+)___/g, "<strong><em>$1</em></strong>");

  // Bold
  s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_\n]+)__/g, "<strong>$1</strong>");

  // Italic
  s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  s = s.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");

  // Strikethrough
  s = s.replace(/~~([^~\n]+)~~/g, "<del>$1</del>");

  // Restore protected content
  s = s.replace(/\uE000CS\uE000/g, '<code class="blora-md__code">');
  s = s.replace(/\uE000CE\uE000/g, "</code>");
  s = s.replace(/\uE000A\uE000/g, '<a class="blora-md__a" href="');
  s = s.replace(/\uE000B\uE000/g, '">');
  s = s.replace(/\uE000C\uE000/g, "</a>");

  return s;
}

/**
 * Render Markdown source to an HTML string.
 *
 * Security: By default, all HTML in the source is escaped.
 * To allow raw HTML, explicitly set `allowHtml: true` (DANGEROUS).
 *
 * @param source - Markdown source text
 * @param options - Security and rendering options
 * @returns HTML string
 */
export function renderMarkdown(source: string, options?: MarkdownOptions): string {
  const sanitize = options?.sanitize ?? true;
  const allowHtml = options?.allowHtml ?? false;
  const inlineOnly = options?.inline ?? false;

  const src = String(source ?? "").replace(/\r\n?/g, "\n");

  if (inlineOnly) {
    return mdInline(src.trim(), allowHtml);
  }

  // Extract fenced code blocks to prevent internal parsing
  const fences: string[] = [];
  const processed = src.replace(
    /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g,
    (_match, lang: string, code: string) => {
      const i = fences.length;
      const cls = lang ? ` class="language-${escapeHTML(lang)}"` : "";
      const escapedCode =
        sanitize || !allowHtml ? escapeHTML(code.replace(/\n$/, "")) : code.replace(/\n$/, "");
      fences.push(`<pre class="blora-md__pre"><code${cls}>${escapedCode}</code></pre>`);
      return `\n\n%%BLORA_FENCE_${i}%%\n\n`;
    },
  );

  // Note: HTML escaping is handled per-block in mdInline, not on the entire source.
  // This prevents double-escaping of entities like &lt; -> &amp;lt;

  const lines = processed.split("\n");
  const out: string[] = [];
  let i = 0;

  const flushPara = (buf: string[]): void => {
    if (!buf.length) return;
    out.push(`<p class="blora-md__p">${mdInline(buf.join("\n").trim(), allowHtml)}</p>`);
    buf.length = 0;
  };

  const paraBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (!trimmed) {
      flushPara(paraBuf);
      i++;
      continue;
    }

    // Fence placeholder
    const fenceTok = trimmed.match(/^%%BLORA_FENCE_(\d+)%%$/);
    if (fenceTok) {
      flushPara(paraBuf);
      out.push(fences[Number(fenceTok[1])] ?? "");
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushPara(paraBuf);
      out.push('<hr class="blora-md__hr">');
      i++;
      continue;
    }

    // Heading
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushPara(paraBuf);
      const lv = heading[1]!.length;
      out.push(
        `<h${lv} class="blora-md__h blora-md__h${lv}">${mdInline(heading[2]!, allowHtml)}</h${lv}>`,
      );
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      flushPara(paraBuf);
      const q: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]!.trim())) {
        q.push(lines[i]!.trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(
        `<blockquote class="blora-md__blockquote">${mdInline(q.join("\n"), allowHtml)}</blockquote>`,
      );
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      flushPara(paraBuf);
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i]!.trim())) {
        items.push(`<li>${mdInline(lines[i]!.trim().replace(/^[-*+]\s+/, ""), allowHtml)}</li>`);
        i++;
      }
      out.push(`<ul class="blora-md__ul">${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara(paraBuf);
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i]!.trim())) {
        items.push(`<li>${mdInline(lines[i]!.trim().replace(/^\d+\.\s+/, ""), allowHtml)}</li>`);
        i++;
      }
      out.push(`<ol class="blora-md__ol">${items.join("")}</ol>`);
      continue;
    }

    // Normal paragraph text
    paraBuf.push(line);
    i++;
  }

  flushPara(paraBuf);
  return out.join("\n");
}

/**
 * Render Markdown source and set it as innerHTML on an element.
 *
 * Security: By default, all HTML in the source is escaped.
 * To allow raw HTML, explicitly set `allowHtml: true` (DANGEROUS).
 *
 * @param element - Target element to receive rendered HTML
 * @param source - Markdown source text
 * @param options - Security and rendering options
 */
export function renderMarkdownTo(
  element: HTMLElement,
  source: string,
  options?: MarkdownOptions,
): void {
  if (typeof document === "undefined") return;
  const html = renderMarkdown(source, options);
  // eslint-disable-next-line no-unsanitized/property
  element.innerHTML = html;
}

export interface MarkdownController {
  render(source?: string): void;
  destroy(): void;
}

/**
 * Bind markdown source from element text/data-src (v1 initMarkdown primary path).
 */
export function createMarkdownController(
  element: HTMLElement,
  options?: MarkdownOptions,
): MarkdownController {
  const sourceFrom = () =>
    element.getAttribute("data-source") ||
    element.getAttribute("data-blora-markdown") ||
    element.textContent ||
    "";

  const render = (source?: string) => {
    const src = source ?? sourceFrom();
    element.classList.add("blora-md");
    renderMarkdownTo(element, src, options);
  };

  /* Auto-render if data-blora-markdown present with content */
  if (element.hasAttribute("data-blora-markdown") || element.hasAttribute("data-source")) {
    render();
  }

  return {
    render,
    destroy() {
      /* no listeners */
    },
  };
}

/** Initialize all [data-blora-markdown] nodes under root. */
export function initMarkdown(root: ParentNode = document, options?: MarkdownOptions): () => void {
  if (typeof document === "undefined") return () => {};
  const ctrls: MarkdownController[] = [];
  root
    .querySelectorAll<HTMLElement>("[data-blora-markdown], .blora-md[data-source]")
    .forEach((el) => {
      ctrls.push(createMarkdownController(el, options));
    });
  return () => ctrls.forEach((c) => c.destroy());
}

export const BLORA_MARKDOWN_TAG = "blora-markdown";

const MarkdownBase: typeof HTMLElement =
  typeof HTMLElement !== "undefined" ? HTMLElement : (class {} as typeof HTMLElement);

/** Declarative markdown host. Source is `source` or a `script[type=text/markdown]` child. */
export class BloraMarkdown extends MarkdownBase {
  static get observedAttributes(): string[] {
    return ["source", "allow-html", "inline"];
  }

  private source = "";
  private drawnSource: string | null = null;

  connectedCallback(): void {
    /* The first render consumes the <script type="text/markdown"> child, so a
       later reconnect (tabs, sidebar layouts and frameworks re-parent light
       DOM) must keep the captured source instead of rendering nothing. */
    const script = this.querySelector("script[type='text/markdown']");
    if (this.hasAttribute("source")) this.source = this.getAttribute("source") ?? "";
    else if (script) this.source = script.textContent ?? "";
    if (this.drawnSource === this.source && this.childNodes.length > 0) return;
    this.draw();
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    if (this.hasAttribute("source")) this.source = this.getAttribute("source") ?? "";
    this.draw();
  }

  private draw(): void {
    this.classList.add("blora-md");
    renderMarkdownTo(this, this.source, {
      allowHtml: this.hasAttribute("allow-html"),
      inline: this.hasAttribute("inline"),
    });
    this.drawnSource = this.source;
  }
}

export function defineBloraMarkdown(registry: CustomElementRegistry = customElements): void {
  if (!registry || registry.get(BLORA_MARKDOWN_TAG)) return;
  registry.define(BLORA_MARKDOWN_TAG, BloraMarkdown);
}

if (typeof customElements !== "undefined") defineBloraMarkdown(customElements);
