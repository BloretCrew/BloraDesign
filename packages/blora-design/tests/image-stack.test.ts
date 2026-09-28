import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createImageStackController } from "../src/components/image-stack/image-stack.js";

describe("createImageStackController", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
    root.innerHTML = `
      <span class="blora-image-stack__index"></span>
      <button class="blora-image-stack__nav--prev"></button>
      <a class="blora-image-stack__tile"><img alt="one"></a>
      <a class="blora-image-stack__tile"><img alt="two"></a>
      <a class="blora-image-stack__tile"><img alt="three"></a>
      <button class="blora-image-stack__nav--next"></button>`;
    document.body.append(root);
  });

  afterEach(() => root.remove());

  it("keeps the current tile and boundary controls in sync", () => {
    const controller = createImageStackController(root);
    expect(root.dataset.index).toBe("0");
    expect(root.querySelectorAll('[data-current]')).toHaveLength(1);
    expect((root.querySelector(".blora-image-stack__nav--prev") as HTMLElement).hidden).toBe(true);
    controller.next();
    expect(controller.getCurrent()).toBe(1);
    expect(root.querySelector(".blora-image-stack__index")!.textContent).toBe("2 / 3");
    expect((root.querySelector(".blora-image-stack__nav--prev") as HTMLElement).hidden).toBe(false);
    controller.goTo(99);
    expect(controller.getCurrent()).toBe(2);
    expect((root.querySelector(".blora-image-stack__nav--next") as HTMLElement).hidden).toBe(true);
    controller.destroy();
  });

  it("navigates with keyboard and horizontal wheel input", () => {
    const controller = createImageStackController(root);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(controller.getCurrent()).toBe(1);
    const event = new WheelEvent("wheel", { deltaX: 140, cancelable: true });
    root.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(controller.getCurrent()).toBe(2);
    controller.destroy();
  });
});
