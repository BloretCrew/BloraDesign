import { describe, it, expect } from "vitest";
import {
  renderMarkdown,
  renderMarkdownTo,
  createMarkdownController,
  initMarkdown,
  BLORA_MARKDOWN_TAG,
} from "../src/index.js";

describe("Markdown add-on", () => {
  it("renders empty source as empty string", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown(null as unknown as string)).toBe("");
  });

  it("renders headings", () => {
    const html = renderMarkdown("# Title");
    expect(html).toContain('<h1 class="blora-md__h blora-md__h1">Title</h1>');
  });

  it("renders h2-h6", () => {
    const html = renderMarkdown("## Subtitle\n### Section");
    expect(html).toContain("blora-md__h2");
    expect(html).toContain("blora-md__h3");
  });

  it("renders bold text", () => {
    const html = renderMarkdown("**bold**");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("renders italic text", () => {
    const html = renderMarkdown("*italic*");
    expect(html).toContain("<em>italic</em>");
  });

  it("renders strikethrough", () => {
    const html = renderMarkdown("~~deleted~~");
    expect(html).toContain("<del>deleted</del>");
  });

  it("renders inline code", () => {
    const html = renderMarkdown("`code`");
    expect(html).toContain('<code class="blora-md__code">code</code>');
  });

  it("renders fenced code blocks", () => {
    const html = renderMarkdown("```js\nconsole.log(1);\n```");
    expect(html).toContain('<pre class="blora-md__pre">');
    expect(html).toContain('class="language-js"');
    expect(html).toContain("console.log(1)");
  });

  it("renders links", () => {
    const html = renderMarkdown("[text](https://example.com)");
    expect(html).toContain('<a class="blora-md__a"');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(">text</a>");
  });

  it("renders images", () => {
    const html = renderMarkdown("![alt](https://example.com/img.png)");
    expect(html).toContain('<img class="blora-md__img"');
    expect(html).toContain('src="https://example.com/img.png"');
    expect(html).toContain('alt="alt"');
  });

  it("renders unordered lists", () => {
    const html = renderMarkdown("- item 1\n- item 2");
    expect(html).toContain('<ul class="blora-md__ul">');
    expect(html).toContain("<li>item 1</li>");
    expect(html).toContain("<li>item 2</li>");
  });

  it("renders ordered lists", () => {
    const html = renderMarkdown("1. first\n2. second");
    expect(html).toContain('<ol class="blora-md__ol">');
    expect(html).toContain("<li>first</li>");
    expect(html).toContain("<li>second</li>");
  });

  it("renders blockquotes", () => {
    const html = renderMarkdown("> quoted text");
    expect(html).toContain('<blockquote class="blora-md__blockquote">');
    expect(html).toContain("quoted text");
  });

  it("renders horizontal rule", () => {
    const html = renderMarkdown("---");
    expect(html).toContain('<hr class="blora-md__hr">');
  });

  it("renders paragraphs", () => {
    const html = renderMarkdown("Hello world");
    expect(html).toContain('<p class="blora-md__p">Hello world</p>');
  });

  it("escapes HTML by default (sanitize: true)", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("does not render raw HTML by default (allowHtml: false)", () => {
    const html = renderMarkdown("<b>bold</b>");
    expect(html).not.toContain("<b>bold</b>");
    expect(html).toContain("&lt;b&gt;");
  });

  it("allows raw HTML when allowHtml: true", () => {
    const html = renderMarkdown("<b>bold</b>", { allowHtml: true });
    expect(html).toContain("<b>bold</b>");
  });

  it("renders inline-only mode", () => {
    const html = renderMarkdown("**bold**", { inline: true });
    expect(html).toContain("<strong>bold</strong>");
    expect(html).not.toContain("<p");
  });

  it("does not render javascript: protocol links", () => {
    const html = renderMarkdown("[click](javascript:alert(1))");
    expect(html).not.toContain('href="javascript:');
  });

  it("renders mailto: links", () => {
    const html = renderMarkdown("[email](mailto:test@example.com)");
    expect(html).toContain('href="mailto:test@example.com"');
  });

  it("renders relative links", () => {
    const html = renderMarkdown("[page](/page)");
    expect(html).toContain('href="/page"');
  });

  it("renderMarkdownTo sets innerHTML on element", () => {
    const el = document.createElement("div");
    renderMarkdownTo(el, "**bold**");
    expect(el.innerHTML).toContain("<strong>bold</strong>");
  });

  it("renderMarkdownTo escapes HTML by default", () => {
    const el = document.createElement("div");
    renderMarkdownTo(el, "<script>alert(1)</script>");
    expect(el.innerHTML).not.toContain("<script>");
  });

  it("does not render code block content as markdown", () => {
    const html = renderMarkdown("```\n**not bold**\n```");
    expect(html).not.toContain("<strong>not bold</strong>");
    expect(html).toContain("**not bold**");
  });

  it("createMarkdownController renders data-source", () => {
    const el = document.createElement("div");
    el.setAttribute("data-blora-markdown", "");
    el.setAttribute("data-source", "**hi**");
    const ctrl = createMarkdownController(el);
    expect(el.innerHTML).toContain("<strong>hi</strong>");
    ctrl.destroy();
  });

  it("blora-markdown renders a script source", () => {
    const el = document.createElement(BLORA_MARKDOWN_TAG);
    const script = document.createElement("script");
    script.type = "text/markdown";
    script.textContent = "# Hello";
    el.append(script);
    document.body.append(el);
    expect(el.innerHTML).toContain("blora-md__h1");
    expect(el.innerHTML).toContain("Hello");
    el.remove();
  });

  it("blora-markdown keeps its content when it is moved", () => {
    const el = document.createElement(BLORA_MARKDOWN_TAG);
    const script = document.createElement("script");
    script.type = "text/markdown";
    script.textContent = "# Moved";
    el.append(script);
    const first = document.createElement("div");
    const second = document.createElement("div");
    document.body.append(first, second);
    first.append(el);
    const rendered = el.firstElementChild;
    second.append(el);
    expect(el.innerHTML).toContain("Moved");
    expect(el.firstElementChild).toBe(rendered);
    first.remove();
    second.remove();
  });

  it("initMarkdown binds nodes", () => {
    document.body.innerHTML = `<div data-blora-markdown data-source="# T"></div>`;
    const off = initMarkdown(document);
    expect(document.querySelector("[data-blora-markdown]")?.innerHTML).toContain("blora-md__h1");
    off();
  });
});
