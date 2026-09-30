import { afterEach, describe, expect, it } from "vitest";
import { hydrateIcons, observeIcons } from "../src/core/icon-hydration.js";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  document.body.replaceChildren();
});

describe("declarative data-icon hydration", () => {
  it("fills buttons, badges and empty placeholders once", () => {
    const button = document.createElement("button");
    button.className = "blora-button";
    button.dataset.icon = "plus";
    button.textContent = "新建";
    const badge = document.createElement("span");
    badge.className = "blora-badge";
    badge.dataset.icon = "info";
    badge.textContent = "提示";
    const placeholder = document.createElement("span");
    placeholder.dataset.icon = "key";
    const authored = document.createElement("span");
    authored.dataset.icon = "key";
    authored.append(document.createElement("b"));
    document.body.append(button, badge, placeholder, authored);

    hydrateIcons(document);
    hydrateIcons(document);

    expect(button.querySelectorAll("svg[data-blora-icon='plus']")).toHaveLength(1);
    expect(button.firstElementChild?.localName).toBe("svg");
    expect(badge.querySelectorAll("svg[data-blora-icon='info']")).toHaveLength(1);
    const icon = placeholder.querySelector("svg[data-blora-icon='key']");
    expect(icon?.getAttribute("width")).toBe("1em");
    expect(placeholder.getAttribute("aria-hidden")).toBe("true");
    expect(authored.querySelector("svg")).toBeNull();
  });

  it("honours data-icon-size and an explicit accessible name", () => {
    const labelled = document.createElement("span");
    labelled.dataset.icon = "settings";
    labelled.dataset.iconSize = "20";
    labelled.setAttribute("role", "img");
    labelled.setAttribute("aria-label", "设置");
    document.body.append(labelled);
    hydrateIcons(labelled);
    expect(labelled.querySelector("svg")?.getAttribute("width")).toBe("20");
    expect(labelled.hasAttribute("aria-hidden")).toBe(false);
  });

  it("observes content rendered later and icon name changes", async () => {
    const stop = observeIcons(document);
    expect(observeIcons(document)).toBe(stop);

    const later = document.createElement("span");
    later.dataset.icon = "home";
    document.body.append(later);
    const button = document.createElement("button");
    button.className = "blora-button";
    button.dataset.icon = "trash";
    document.body.append(button);
    await flush();
    expect(later.querySelector("svg[data-blora-icon='home']")).not.toBeNull();
    expect(button.querySelector("svg[data-blora-icon='trash']")).not.toBeNull();

    later.dataset.icon = "user";
    await flush();
    expect(later.querySelectorAll("svg")).toHaveLength(1);
    expect(later.querySelector("svg")?.getAttribute("data-blora-icon")).toBe("user");

    stop();
    const ignored = document.createElement("span");
    ignored.dataset.icon = "home";
    document.body.append(ignored);
    await flush();
    expect(ignored.querySelector("svg")).toBeNull();
  });

  it("ignores unknown icon names", () => {
    const unknown = document.createElement("span");
    unknown.dataset.icon = "definitely-not-an-icon";
    document.body.append(unknown);
    hydrateIcons(document);
    expect(unknown.querySelector("svg")).toBeNull();
  });
});
