import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defineBloraAccordion } from "../src/components/accordion/index.js";
import { defineBloraCollapse } from "../src/components/collapse/index.js";
import { defineBloraCommand } from "../src/components/command-palette/index.js";
import { defineBloraDatepicker } from "../src/components/datepicker/index.js";
import { defineBloraRange } from "../src/components/range/index.js";
import { defineBloraSearch } from "../src/components/search/index.js";
import { defineBloraSegmented } from "../src/components/segmented/index.js";
import { defineBloraTabs } from "../src/components/tabs/index.js";
import { defineBloraTimepicker } from "../src/components/timepicker/index.js";
import { defineBloraTransfer } from "../src/components/transfer/index.js";
import { defineBloraStatistic } from "../src/components/statistic/index.js";
import { defineBloraSteps } from "../src/components/steps/index.js";
import { defineBloraRadio } from "../src/components/radio/index.js";
import { defineBloraSwitch } from "../src/components/switch/index.js";
import { defineBloraSlider } from "../src/components/slider/index.js";
import { defineBloraRate } from "../src/components/rate/index.js";
import { defineBloraOtp } from "../src/components/otp/index.js";
import { defineBloraTagsInput } from "../src/components/tags-input/index.js";
import { defineBloraCheckbox } from "../src/components/checkbox/index.js";
import { defineBloraField } from "../src/components/field/index.js";
import { defineBloraUpload } from "../src/components/upload/index.js";
import { defineBloraTooltip } from "../src/components/tooltip/index.js";
import { defineBloraPopover } from "../src/components/popover/index.js";
import { defineBloraPopconfirm } from "../src/components/popconfirm/index.js";
import { defineBloraDropdown } from "../src/components/dropdown/index.js";
import { defineBloraDrawer } from "../src/components/drawer/index.js";
import { defineBloraBacktop } from "../src/components/backtop/index.js";
import { defineBloraCopy } from "../src/components/copy/index.js";
import { defineBloraProgress } from "../src/components/progress/index.js";
import { defineBloraNumberInput } from "../src/components/number-input/index.js";
import { defineBloraSwap } from "../src/components/swap/index.js";
import { defineBloraPagination } from "../src/components/pagination/index.js";
import { defineBloraColorPicker } from "../src/components/color-picker/index.js";
import { defineBloraAutocomplete } from "../src/components/autocomplete/index.js";
import { defineBloraMentions } from "../src/components/mentions/index.js";
import { defineBloraCascader } from "../src/components/cascader/index.js";
import { defineBloraTree } from "../src/components/tree/index.js";
import { defineBloraTreeSelect } from "../src/components/tree-select/index.js";
import { defineBloraCalendar } from "../src/components/calendar/index.js";
import { defineBloraCarousel } from "../src/components/carousel/index.js";
import { defineBloraDeck } from "../src/components/deck/index.js";
import { defineBloraImageStack } from "../src/components/image-stack/index.js";
import { defineBloraImage } from "../src/components/image/index.js";
import { defineBloraDock } from "../src/components/dock/index.js";
import { defineBloraMegamenu } from "../src/components/megamenu/index.js";
import { defineBloraSpeedDial } from "../src/components/speed-dial/index.js";
import { defineBloraSplitter } from "../src/components/splitter/index.js";
import { defineBloraTour } from "../src/components/tour/index.js";
import { defineBloraAlert } from "../src/components/alert/index.js";
import { defineBloraBanner } from "../src/components/banner/index.js";
import { defineBloraBreadcrumb } from "../src/components/breadcrumb/index.js";
import { defineBloraChartContainer } from "../src/components/chart-container/index.js";
import { defineBloraChat } from "../src/components/chat/index.js";
import { defineBloraComment } from "../src/components/comment/index.js";
import { defineBloraEmpty } from "../src/components/empty/index.js";
import { defineBloraMockup } from "../src/components/mockup/index.js";
import { defineBloraNavbar } from "../src/components/navbar/index.js";
import { defineBloraSidebarNav } from "../src/components/sidebar-nav/index.js";
import { defineBloraResult } from "../src/components/result/index.js";
import { defineBloraTimeline } from "../src/components/timeline/index.js";

for (const define of [
  defineBloraAccordion,
  defineBloraCollapse,
  defineBloraCommand,
  defineBloraDatepicker,
  defineBloraRange,
  defineBloraSearch,
  defineBloraSegmented,
  defineBloraTabs,
  defineBloraTimepicker,
  defineBloraTransfer,
  defineBloraStatistic,
  defineBloraSteps,
  defineBloraRadio,
  defineBloraSwitch,
  defineBloraSlider,
  defineBloraRate,
  defineBloraOtp,
  defineBloraTagsInput,
  defineBloraCheckbox,
  defineBloraField,
  defineBloraUpload,
  defineBloraTooltip,
  defineBloraPopover,
  defineBloraPopconfirm,
  defineBloraDropdown,
  defineBloraDrawer,
  defineBloraBacktop,
  defineBloraCopy,
  defineBloraProgress,
  defineBloraNumberInput,
  defineBloraSwap,
  defineBloraPagination,
  defineBloraColorPicker,
  defineBloraAutocomplete,
  defineBloraMentions,
  defineBloraCascader,
  defineBloraTree,
  defineBloraTreeSelect,
  defineBloraCalendar,
  defineBloraCarousel,
  defineBloraDeck,
  defineBloraImageStack,
  defineBloraImage,
  defineBloraDock,
  defineBloraMegamenu,
  defineBloraSpeedDial,
  defineBloraSplitter,
  defineBloraTour,
  defineBloraAlert,
  defineBloraBanner,
  defineBloraBreadcrumb,
  defineBloraChartContainer,
  defineBloraChat,
  defineBloraComment,
  defineBloraEmpty,
  defineBloraMockup,
  defineBloraNavbar,
  defineBloraSidebarNav,
  defineBloraResult,
  defineBloraTimeline,
]) {
  define(window.customElements);
}

const DEFAULT_TAGS = [
  "blora-accordion",
  "blora-collapse",
  "blora-command",
  "blora-datepicker",
  "blora-range",
  "blora-search",
  "blora-segmented",
  "blora-tabs",
  "blora-timepicker",
  "blora-transfer",
  "blora-statistic",
  "blora-steps",
  "blora-radio",
  "blora-switch",
  "blora-slider",
  "blora-rate",
  "blora-otp",
  "blora-tags-input",
  "blora-checkbox",
  "blora-field",
  "blora-upload",
  "blora-tooltip",
  "blora-popover",
  "blora-popconfirm",
  "blora-dropdown",
  "blora-drawer",
  "blora-backtop",
  "blora-copy",
  "blora-progress",
  "blora-number-input",
  "blora-swap",
  "blora-pagination",
  "blora-color-picker",
  "blora-autocomplete",
  "blora-mentions",
  "blora-cascader",
  "blora-tree",
  "blora-tree-select",
  "blora-calendar",
  "blora-carousel",
  "blora-deck",
  "blora-image-stack",
  "blora-image",
  "blora-dock",
  "blora-megamenu",
  "blora-speed-dial",
  "blora-splitter",
  "blora-tour",
  "blora-alert",
  "blora-banner",
  "blora-breadcrumb",
  "blora-chart-container",
  "blora-chat",
  "blora-comment",
  "blora-empty",
  "blora-mockup",
  "blora-navbar",
  "blora-sidebar-nav",
  "blora-result",
  "blora-timeline",
] as const;

const autoSource = readFileSync(resolve(import.meta.dirname, "../src/auto.ts"), "utf8");

function appendHost<T extends HTMLElement>(
  tag: string,
  attributes: Record<string, string> = {},
): T {
  const host = document.createElement(tag) as T;
  for (const [name, value] of Object.entries(attributes)) host.setAttribute(name, value);
  document.body.appendChild(host);
  return host;
}

function definition(
  tag: string,
  text: string,
  attributes: Record<string, string> = {},
): HTMLElement {
  const item = document.createElement(tag);
  item.textContent = text;
  for (const [name, value] of Object.entries(attributes)) item.setAttribute(name, value);
  return item;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("Composite Custom Elements", () => {
  it("defines every new Composite CE and includes the complete surface in auto", () => {
    for (const tag of DEFAULT_TAGS) expect(customElements.get(tag), tag).toBeTypeOf("function");
    for (const defineName of [
      "defineBloraAccordion",
      "defineBloraCollapse",
      "defineBloraCommand",
      "defineBloraDatepicker",
      "defineBloraDialog",
      "defineBloraRange",
      "defineBloraSearch",
      "defineBloraSegmented",
      "defineBloraSelect",
      "defineBloraTabs",
      "defineBloraTimepicker",
      "defineBloraTransfer",
      "defineBloraStatistic",
      "defineBloraSteps",
      "defineBloraRadio",
      "defineBloraSwitch",
      "defineBloraSlider",
      "defineBloraRate",
      "defineBloraOtp",
      "defineBloraTagsInput",
      "defineBloraCheckbox",
      "defineBloraField",
      "defineBloraUpload",
      "defineBloraTooltip",
      "defineBloraPopover",
      "defineBloraPopconfirm",
      "defineBloraDropdown",
      "defineBloraDrawer",
      "defineBloraBacktop",
      "defineBloraCopy",
      "defineBloraProgress",
      "defineBloraNumberInput",
      "defineBloraSwap",
      "defineBloraPagination",
      "defineBloraColorPicker",
      "defineBloraAutocomplete",
      "defineBloraMentions",
      "defineBloraCascader",
      "defineBloraTree",
      "defineBloraTreeSelect",
      "defineBloraCalendar",
      "defineBloraCarousel",
      "defineBloraDeck",
      "defineBloraImageStack",
      "defineBloraImage",
      "defineBloraDock",
      "defineBloraMegamenu",
      "defineBloraSpeedDial",
      "defineBloraSplitter",
      "defineBloraTour",
      "defineBloraAlert",
      "defineBloraBanner",
      "defineBloraBreadcrumb",
      "defineBloraChartContainer",
      "defineBloraChat",
      "defineBloraComment",
      "defineBloraEmpty",
      "defineBloraMockup",
      "defineBloraNavbar",
      "defineBloraSidebarNav",
      "defineBloraResult",
      "defineBloraTimeline",
    ]) {
      expect(autoSource, `${defineName} missing from auto.ts`).toContain(`${defineName}(registry)`);
    }
  });

  it("mounts action, progress, pagination and color-picker official trees", () => {
    const backtop = appendHost<HTMLElement>("blora-backtop", { "show-after": "80" });
    expect(backtop.querySelector(".blora-backtop svg")).not.toBeNull();

    const copy = appendHost<HTMLElement>("blora-copy", { text: "npm i blora" });
    expect(copy.querySelector(".blora-code")?.textContent).toBe("npm i blora");
    expect(copy.querySelector(".blora-copy__btn svg")).not.toBeNull();

    const progress = appendHost<HTMLElement & { setValue(value: number): void }>("blora-progress", {
      label: "Upload",
      value: "30",
    });
    progress.setValue(65);
    expect(progress.querySelector<HTMLElement>(".blora-progress__fill")?.style.width).toBe("65%");
    expect(progress.querySelector("[data-progress-label]")?.textContent).toBe("65%");

    const circular = appendHost<HTMLElement & { setValue(value: number): void }>("blora-progress", {
      label: "Sync",
      value: "40",
      shape: "circular",
      variant: "success",
    });
    expect(circular.querySelector(".blora-progress__ring")).not.toBeNull();
    circular.setValue(70);
    expect(
      circular.querySelector<HTMLElement>(".blora-progress__ring-fill")?.style.strokeDashoffset,
    ).toBe("30");
    expect(circular.querySelector("[data-progress-label]")?.textContent).toBe("70%");

    const pagination = appendHost<HTMLElement & { page: number }>("blora-pagination", {
      page: "1",
      total: "5",
    });
    pagination.querySelectorAll<HTMLButtonElement>(".blora-pagination__item")[2]!.click();
    expect(pagination.page).toBe(2);
    expect(pagination.getAttribute("page")).toBe("2");

    const windowedPagination = appendHost<HTMLElement & { page: number }>("blora-pagination", {
      page: "7",
      total: "12",
      "max-visible": "7",
    });
    expect(windowedPagination.querySelectorAll(".blora-pagination__ellipsis")).toHaveLength(2);
    expect(windowedPagination.querySelector(".blora-pagination__track")).not.toBeNull();
    expect(
      Array.from(windowedPagination.querySelectorAll<HTMLButtonElement>("[data-page]"))
        .filter((button) => !button.hasAttribute("aria-hidden"))
        .map((button) => button.dataset.page),
    ).toEqual(["1", "5", "6", "7", "8", "9", "12"]);
    windowedPagination.page = 8;
    expect(
      windowedPagination.style.getPropertyValue("--blora-pagination-offset") ||
        windowedPagination
          .querySelector<HTMLElement>(".blora-pagination")
          ?.style.getPropertyValue("--blora-pagination-offset"),
    ).toBe("4");
    expect(
      Array.from(windowedPagination.querySelectorAll<HTMLButtonElement>("[data-page]"))
        .filter((button) => !button.hasAttribute("aria-hidden"))
        .map((button) => button.dataset.page),
    ).toEqual(["1", "6", "7", "8", "9", "10", "11", "12"]);
    expect(
      windowedPagination.querySelector('[data-edge="end"]')?.hasAttribute("data-inactive"),
    ).toBe(true);
    expect(
      windowedPagination.querySelector('[data-edge="start"]')?.hasAttribute("data-inactive"),
    ).toBe(false);

    windowedPagination.page = 5;
    expect(
      Array.from(windowedPagination.querySelectorAll<HTMLButtonElement>("[data-page]"))
        .filter((button) => !button.hasAttribute("aria-hidden"))
        .map((button) => button.dataset.page),
    ).toEqual(["1", "2", "3", "4", "5", "6", "7", "12"]);
    expect(
      windowedPagination.querySelector('[data-edge="start"]')?.hasAttribute("data-inactive"),
    ).toBe(true);
    expect(
      windowedPagination
        .querySelector<HTMLElement>(".blora-pagination")
        ?.style.getPropertyValue("--blora-pagination-window"),
    ).toBe("6");

    const picker = appendHost<HTMLElement & { value: string }>("blora-color-picker", {
      value: "#3B82F6",
    });
    expect(picker.querySelector(".blora-color-spectrum__cursor")).not.toBeNull();
    expect(picker.querySelector<HTMLInputElement>(".blora-color-hex")?.value).toBe("#3B82F6");
  });

  it("mounts overlay-family official trees and controller interactions", () => {
    const tooltip = appendHost<HTMLElement>("blora-tooltip", {
      trigger: "Help",
      text: "Helpful text",
    });
    expect(tooltip.querySelector('.blora-tooltip__bubble[role="tooltip"]')?.textContent).toBe(
      "Helpful text",
    );

    const popover = appendHost<HTMLElement>("blora-popover", { content: "Panel content" });
    popover.querySelector<HTMLButtonElement>(".blora-popover__trigger")!.click();
    expect(popover.querySelector(".blora-popover")?.hasAttribute("data-open")).toBe(true);

    const popconfirm = appendHost<HTMLElement>("blora-popconfirm", { message: "Delete?" });
    let confirmed = false;
    popconfirm.addEventListener("blora-confirm", () => (confirmed = true));
    popconfirm.querySelector<HTMLButtonElement>(".blora-popconfirm__trigger")!.click();
    popconfirm.querySelector<HTMLButtonElement>("[data-confirm]")!.click();
    expect(confirmed).toBe(true);

    const dropdown = document.createElement("blora-dropdown");
    dropdown.append(
      definition("blora-dropdown-item", "Edit", { value: "edit" }),
      definition("blora-dropdown-item", "Delete", { value: "delete", separator: "" }),
    );
    document.body.appendChild(dropdown);
    dropdown.querySelector<HTMLButtonElement>("[data-dropdown-trigger]")!.click();
    expect(dropdown.querySelector(".blora-dropdown")?.hasAttribute("data-open")).toBe(true);
    expect(dropdown.querySelectorAll(".blora-dropdown__item")).toHaveLength(2);

    dropdown.setAttribute("placement", "top");
    expect(dropdown.querySelector<HTMLElement>(".blora-dropdown")?.dataset.placement).toBe("top");

    const custom = document.createElement("blora-dropdown");
    custom.innerHTML = `
      <div slot="trigger" aria-label="Loong 用户菜单">
        <strong>Loong</strong>
      </div>
      <blora-dropdown-item value="profile">个人资料</blora-dropdown-item>`;
    document.body.append(custom);
    const customTrigger = custom.querySelector<HTMLElement>("[data-dropdown-trigger]")!;
    expect(customTrigger.dataset.trigger).toBe("custom");
    customTrigger.click();
    expect(custom.querySelector(".blora-dropdown")?.hasAttribute("data-open")).toBe(true);

    const drawer = appendHost<HTMLElement & { open(): void }>("blora-drawer", {
      title: "Details",
    });
    drawer.open();
    expect(drawer.querySelector(".blora-drawer")?.hasAttribute("data-open")).toBe(true);
  });

  it("mounts checkbox groups, fields and upload official native-control trees", () => {
    const group = document.createElement("blora-checkbox") as HTMLElement & { values: string[] };
    group.setAttribute("name", "options");
    group.append(
      definition("blora-checkbox-option", "全选", { "check-all": "" }),
      definition("blora-checkbox-option", "选项 A", { value: "a" }),
      definition("blora-checkbox-option", "选项 B", { value: "b" }),
    );
    document.body.appendChild(group);
    expect(group.querySelectorAll('.blora-checkbox input[type="checkbox"]')).toHaveLength(3);
    group.querySelector<HTMLInputElement>("input[data-blora-checkall]")!.click();
    expect(group.values).toEqual(["a", "b"]);

    const field = appendHost<HTMLElement & { value: string }>("blora-field", {
      label: "用户名",
      minlength: "2",
      name: "username",
      limit: "3",
      validate: "email",
    });
    const input = field.querySelector<HTMLInputElement>("input")!;
    expect(input.minLength).toBe(2);
    expect(field.querySelector(".blora-field")?.getAttribute("data-blora-validate")).toBe("email");
    expect(field.querySelector<HTMLElement>(".blora-field__error")?.hidden).toBe(true);
    input.value = "Blora";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(field.value).toBe("Blora");
    expect(field.querySelector(".blora-limit[data-over-limit]")).not.toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("true");

    const upload = appendHost<HTMLElement>("blora-upload", { multiple: "" });
    expect(upload.querySelector(".blora-dropzone svg")).not.toBeNull();
    expect(upload.querySelector<HTMLInputElement>('input[type="file"]')?.multiple).toBe(true);
    expect(upload.querySelector(".blora-upload__list")).not.toBeNull();

    const compactUpload = appendHost<HTMLElement>("blora-upload", {
      variant: "compact",
      prompt: "选择附件",
    });
    expect(compactUpload.querySelector("button.blora-file-picker__trigger svg")).not.toBeNull();
    expect(compactUpload.querySelector(".blora-file-picker__label")?.textContent).toBe("选择附件");

    const numberInput = appendHost<HTMLElement & { value: number }>("blora-number-input", {
      label: "数量",
      value: "3",
      min: "0",
      max: "4",
    });
    numberInput.querySelector<HTMLButtonElement>('[data-direction="1"]')!.click();
    expect(numberInput.value).toBe(4);
    expect(numberInput.getAttribute("value")).toBe("4");

    const swap = appendHost<HTMLElement & { checked: boolean }>("blora-swap", {
      "off-label": "深色模式",
      "on-label": "浅色模式",
    });
    expect(swap.querySelector(".blora-swap__label")?.textContent).toBe("深色模式");
    swap.querySelector<HTMLInputElement>("input")!.click();
    expect(swap.checked).toBe(true);
    expect(swap.querySelector(".blora-swap__label")?.textContent).toBe("浅色模式");
    expect(swap.querySelector(".blora-swap__visual svg")).not.toBeNull();
  });

  it("mounts slider, rate, OTP and tags-input official trees and controller behavior", async () => {
    const slider = appendHost<HTMLElement & { value: number }>("blora-slider", {
      min: "0",
      max: "100",
      value: "42",
      tooltip: "",
    });
    const range = slider.querySelector<HTMLInputElement>('input[type="range"]')!;
    range.value = "75";
    range.dispatchEvent(new Event("input", { bubbles: true }));
    expect(slider.value).toBe(75);
    expect(slider.getAttribute("value")).toBe("75");
    expect(slider.querySelector(".blora-slider__value")?.textContent).toBe("75");

    const rate = appendHost<HTMLElement & { value: number }>("blora-rate", { value: "2" });
    rate.querySelectorAll<HTMLElement>(".blora-rate__star")[3]!.click();
    expect(rate.value).toBe(4);
    expect(rate.getAttribute("value")).toBe("4");

    const otp = appendHost<HTMLElement & { value: string }>("blora-otp", {
      length: "4",
      mode: "numeric",
    });
    const firstOtp = otp.querySelector<HTMLInputElement>(".blora-otp__input")!;
    firstOtp.value = "7";
    firstOtp.dispatchEvent(new Event("input", { bubbles: true }));
    expect(otp.value).toBe("7");
    expect(otp.querySelectorAll(".blora-otp__input")).toHaveLength(4);

    const tags = appendHost<HTMLElement & { values: string[] }>("blora-tags-input", {
      values: "React,Vue",
    });
    const tagsInput = tags.querySelector<HTMLInputElement>("input")!;
    tagsInput.value = "Svelte";
    tagsInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await Promise.resolve();
    expect(tags.values).toEqual(["React", "Vue", "Svelte"]);
  });

  it("owns statistic, steps, radio and switch official light DOM and state", () => {
    const statistic = appendHost<HTMLElement>("blora-statistic", {
      label: "活跃用户",
      value: "12,847",
      suffix: "人",
      trend: "↑ 12.5%",
      direction: "up",
    });
    expect(statistic.shadowRoot).toBeNull();
    expect(statistic.querySelector(".blora-stat[data-blora-generated]")).not.toBeNull();
    expect(statistic.querySelector(".blora-stat__value")?.textContent).toBe("12,847人");
    expect(statistic.querySelector(".blora-stat__trend")?.getAttribute("data-direction")).toBe(
      "up",
    );

    const steps = document.createElement("blora-steps") as HTMLElement & {
      setCurrent(index: number): void;
    };
    steps.setAttribute("current", "1");
    steps.append(
      definition("blora-step", "", { title: "需求", description: "确认需求" }),
      definition("blora-step", "", { title: "开发", description: "实现功能" }),
      definition("blora-step", "", { title: "发布" }),
    );
    document.body.appendChild(steps);
    expect(steps.querySelectorAll(".blora-step")).toHaveLength(3);
    expect(steps.querySelectorAll('.blora-step[data-state="done"]')).toHaveLength(1);
    expect(steps.querySelector('.blora-step[data-state="active"]')?.textContent).toContain("开发");
    steps.setCurrent(2);
    expect(steps.querySelectorAll('.blora-step[data-state="done"]')).toHaveLength(2);

    const radioA = appendHost<HTMLElement & { checked: boolean }>("blora-radio", {
      name: "choice",
      value: "a",
      checked: "",
    });
    const radioB = appendHost<HTMLElement & { checked: boolean }>("blora-radio", {
      name: "choice",
      value: "b",
    });
    radioB.querySelector<HTMLInputElement>("input")!.click();
    expect(radioB.checked).toBe(true);
    expect(radioA.checked).toBe(false);

    const toggle = appendHost<HTMLElement & { checked: boolean }>("blora-switch");
    toggle.querySelector<HTMLInputElement>("input")!.click();
    expect(toggle.checked).toBe(true);
    expect(toggle.hasAttribute("checked")).toBe(true);
  });

  it("mounts range, datepicker, timepicker and search official light DOM", () => {
    const range = appendHost<HTMLElement>("blora-range", { values: "25,70" });
    expect(range.shadowRoot).toBeNull();
    expect(range.querySelector(".blora-range[data-blora-generated]")).not.toBeNull();
    expect(range.querySelector(".blora-range__track .blora-range__fill")).not.toBeNull();
    expect(range.querySelectorAll(".blora-range__thumb")).toHaveLength(2);

    const date = appendHost<HTMLElement>("blora-datepicker", { name: "date" });
    expect(date.querySelector('.blora-datepicker input.blora-input[type="date"]')).not.toBeNull();
    expect(date.querySelector(".blora-datepicker__btn svg")).not.toBeNull();
    expect(date.querySelector(".blora-datepicker__panel")).not.toBeNull();

    const time = appendHost<HTMLElement>("blora-timepicker", { value: "14:30" });
    expect(time.querySelector('.blora-timepicker input.blora-input[type="time"]')).not.toBeNull();
    expect(time.querySelector(".blora-timepicker__btn svg")).not.toBeNull();
    expect(time.querySelector(".blora-timepicker__panel")).not.toBeNull();

    const search = appendHost<HTMLElement>("blora-search", { placeholder: "搜索项目" });
    const input = search.querySelector<HTMLInputElement>("input")!;
    const clear = search.querySelector<HTMLButtonElement>(".blora-search__clear")!;
    input.value = "Blora";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(clear.hidden).toBe(false);
    clear.click();
    expect(input.value).toBe("");
  });

  it("mounts transfer definitions and reuses the transfer controller", () => {
    const host = document.createElement("blora-transfer") as HTMLElement & {
      selectedValues: string[];
    };
    host.append(
      definition("blora-transfer-item", "张三", { value: "zhang" }),
      definition("blora-transfer-item", "李四", { value: "li", target: "" }),
    );
    document.body.appendChild(host);

    expect(host.querySelectorAll(".blora-transfer__panel")).toHaveLength(2);
    expect(host.querySelectorAll(".blora-transfer__row")).toHaveLength(2);
    expect(host.selectedValues).toEqual(["li"]);
    const sourceCheck = host.querySelector<HTMLInputElement>(
      '.blora-transfer__panel:first-child input[data-value="zhang"]',
    )!;
    sourceCheck.checked = true;
    host.querySelector<HTMLButtonElement>('[data-transfer="right"]')!.click();
    expect(host.selectedValues).toEqual(["li", "zhang"]);
  });

  it("mounts accordion, collapse, command, segmented and tabs official trees", () => {
    const accordion = document.createElement("blora-accordion");
    accordion.append(
      definition("blora-accordion-item", "内容 A", { heading: "标题 A", open: "" }),
      definition("blora-accordion-item", "内容 B", { heading: "标题 B" }),
    );
    document.body.appendChild(accordion);
    expect(accordion.querySelectorAll(".blora-accordion__head")).toHaveLength(2);
    expect(accordion.querySelector(".blora-accordion__content")?.textContent).toContain("内容 A");
    const accordionHead = accordion.querySelector<HTMLButtonElement>(".blora-accordion__head")!;
    const accordionPanel = accordion.querySelector<HTMLElement>(".blora-accordion__body")!;
    expect(accordionHead.getAttribute("aria-controls")).toBe(accordionPanel.id);
    expect(accordionPanel.getAttribute("role")).toBe("region");
    expect(accordionPanel.getAttribute("aria-labelledby")).toBe(accordionHead.id);
    expect(accordionPanel.getAttribute("aria-hidden")).toBe("false");

    const collapse = document.createElement("blora-collapse");
    collapse.append(definition("blora-collapse-item", "内容", { heading: "标题", open: "" }));
    document.body.appendChild(collapse);
    const collapseHead = collapse.querySelector<HTMLButtonElement>(".blora-collapse__head")!;
    const collapsePanel = collapse.querySelector<HTMLElement>(".blora-collapse__body")!;
    expect(collapseHead.getAttribute("aria-expanded")).toBe("true");
    expect(collapseHead.getAttribute("aria-controls")).toBe(collapsePanel.id);
    expect(collapsePanel.getAttribute("role")).toBe("region");
    expect(collapsePanel.getAttribute("aria-labelledby")).toBe(collapseHead.id);
    expect(collapsePanel.getAttribute("aria-hidden")).toBe("false");
    collapseHead.click();
    expect(collapseHead.getAttribute("aria-expanded")).toBe("false");
    expect(collapsePanel.getAttribute("aria-hidden")).toBe("true");

    const command = document.createElement("blora-command");
    command.append(
      definition("blora-command-item", "新建文档", {
        icon: "document",
        shortcut: "⌘N",
        value: "new",
      }),
    );
    document.body.appendChild(command);
    expect(command.querySelector(".blora-command__search .blora-search__icon svg")).not.toBeNull();
    expect(command.querySelector(".blora-command__item .blora-command__kbd")).not.toBeNull();

    const segmented = document.createElement("blora-segmented") as HTMLElement & { value: string };
    segmented.append(
      definition("blora-segment", "日", { value: "day", selected: "" }),
      definition("blora-segment", "周", { value: "week" }),
    );
    document.body.appendChild(segmented);
    expect(segmented.querySelector(".blora-segmented__indicator")).not.toBeNull();
    expect(segmented.querySelectorAll(".blora-segmented__item")).toHaveLength(2);
    expect(segmented.value).toBe("day");

    const tabs = document.createElement("blora-tabs") as HTMLElement & {
      select(index: number): void;
    };
    tabs.setAttribute("flush", "");
    tabs.append(
      definition("blora-tab", "面板 A", { label: "概览", value: "overview", selected: "" }),
      definition("blora-tab", "面板 B", { label: "详情", value: "details" }),
    );
    document.body.appendChild(tabs);
    expect(tabs.querySelectorAll(".blora-tabs__tab")).toHaveLength(2);
    expect(tabs.querySelectorAll(".blora-tabs__panel")).toHaveLength(2);
    expect(tabs.querySelector(".blora-tabs")?.hasAttribute("data-flush")).toBe(true);
    tabs.select(1);
    expect(tabs.querySelectorAll(".blora-tabs__tab")[1]?.getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("owns autocomplete, mentions, cascader, tree and tree-select structures", () => {
    const autocomplete = document.createElement("blora-autocomplete") as HTMLElement & {
      value: string;
    };
    autocomplete.setAttribute("label", "Component");
    autocomplete.append(
      definition("blora-autocomplete-option", "", { value: "Button" }),
      definition("blora-autocomplete-option", "", { value: "Badge" }),
    );
    document.body.appendChild(autocomplete);
    const autocompleteInput = autocomplete.querySelector<HTMLInputElement>("input")!;
    autocompleteInput.value = "But";
    autocompleteInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(autocomplete.querySelectorAll(".blora-autocomplete__option")).toHaveLength(1);
    autocomplete.querySelector<HTMLElement>(".blora-autocomplete__option")!.click();
    expect(autocomplete.value).toBe("Button");

    const mentions = document.createElement("blora-mentions");
    mentions.append(definition("blora-mention", "", { value: "alice", label: "Alice" }));
    document.body.appendChild(mentions);
    expect(mentions.querySelector("textarea.blora-textarea")).not.toBeNull();
    expect(mentions.querySelector(".blora-mentions")?.getAttribute("data-options")).toContain(
      "alice",
    );

    const cascader = document.createElement("blora-cascader");
    const department = definition("blora-cascader-option", "", { label: "技术部" });
    department.append(definition("blora-cascader-option", "", { label: "前端组" }));
    cascader.append(department);
    document.body.appendChild(cascader);
    cascader.querySelector<HTMLButtonElement>(".blora-cascader__trigger")!.click();
    expect(cascader.querySelectorAll(".blora-cascader__column")).toHaveLength(1);
    cascader.querySelector<HTMLElement>(".blora-cascader__option")!.click();
    expect(cascader.querySelectorAll(".blora-cascader__column")).toHaveLength(2);

    const tree = document.createElement("blora-tree") as HTMLElement & { value: string };
    const branch = definition("blora-tree-node", "", {
      label: "技术部",
      value: "tech",
      open: "",
    });
    branch.append(definition("blora-tree-node", "", { label: "前端组", value: "frontend" }));
    tree.append(branch);
    document.body.appendChild(tree);
    expect(tree.querySelectorAll(".blora-tree__node")).toHaveLength(2);
    tree.querySelectorAll<HTMLElement>(".blora-tree__node")[1]!.click();
    expect(tree.value).toBe("frontend");

    const treeSelect = document.createElement("blora-tree-select") as HTMLElement & {
      value: string;
      open(): void;
    };
    const region = definition("blora-tree-select-option", "", {
      label: "华东",
      value: "east",
    });
    region.append(definition("blora-tree-select-option", "", { label: "上海", value: "sh" }));
    treeSelect.append(region);
    document.body.appendChild(treeSelect);
    treeSelect.open();
    expect(treeSelect.querySelector(".blora-treeselect")?.getAttribute("data-open")).toBe("");
    treeSelect.querySelectorAll<HTMLElement>(".blora-treeselect__node")[0]!.click();
    treeSelect.querySelectorAll<HTMLElement>(".blora-treeselect__node")[1]!.click();
    expect(treeSelect.value).toBe("sh");
  });

  it("owns calendar, carousel, deck and image official structures", () => {
    const calendar = appendHost<HTMLElement & { value: string }>("blora-calendar", {
      value: "2026-08-08",
    });
    expect(calendar.querySelectorAll(".blora-calendar__cell[data-day]").length).toBeGreaterThan(27);
    calendar.querySelector<HTMLElement>('.blora-calendar__cell[data-day="9"]')!.click();
    expect(calendar.value).toBe("2026-08-09");

    const carousel = document.createElement("blora-carousel") as HTMLElement & {
      current: number;
      next(): void;
    };
    carousel.append(
      definition("blora-carousel-slide", "First", { label: "First" }),
      definition("blora-carousel-slide", "Second", { label: "Second" }),
    );
    document.body.appendChild(carousel);
    expect(carousel.querySelectorAll(".blora-carousel__slide")).toHaveLength(2);
    carousel.next();
    expect(carousel.current).toBe(1);

    const deck = document.createElement("blora-deck") as HTMLElement & {
      current: number;
      next(): void;
    };
    deck.append(definition("blora-deck-card", "One"), definition("blora-deck-card", "Two"));
    document.body.appendChild(deck);
    expect(deck.querySelectorAll("article.blora-card")).toHaveLength(2);
    deck.next();
    expect(deck.current).toBe(1);

    const image = appendHost<HTMLElement>("blora-image", {
      src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
      alt: "Pixel",
      caption: "Preview",
      variant: "preview",
      preview: "",
    });
    expect(image.querySelector("figure.blora-image[data-blora-generated]")).not.toBeNull();
    expect(image.querySelector("img")?.getAttribute("alt")).toBe("Pixel");
    expect(image.querySelector(".blora-image__cap")?.textContent).toBe("Preview");
  });

  it("owns dock, megamenu, speed-dial, splitter and tour structures", () => {
    const dock = document.createElement("blora-dock") as HTMLElement & {
      current: number;
      select(index: number): void;
    };
    dock.append(
      definition("blora-dock-item", "Home", { value: "home", active: "" }),
      definition("blora-dock-item", "Search", { value: "search" }),
    );
    document.body.appendChild(dock);
    expect(dock.querySelectorAll(".blora-dock__item")).toHaveLength(2);
    dock.select(1);
    expect(dock.current).toBe(1);

    const menu = document.createElement("blora-megamenu") as HTMLElement & { open(): void };
    const section = definition("blora-megamenu-section", "", { title: "Work" });
    const link = document.createElement("a");
    link.href = "#projects";
    link.textContent = "Projects";
    section.appendChild(link);
    menu.appendChild(section);
    document.body.appendChild(menu);
    menu.open();
    expect(menu.hasAttribute("open")).toBe(true);
    expect(menu.querySelector(".blora-megamenu__link")?.textContent).toBe("Projects");

    const dial = document.createElement("blora-speed-dial") as HTMLElement & { open(): void };
    dial.append(definition("blora-speed-dial-action", "C", { value: "camera", label: "Camera" }));
    document.body.appendChild(dial);
    dial.open();
    expect(dial.hasAttribute("open")).toBe(true);
    expect(dial.querySelectorAll(".blora-speed-dial__action")).toHaveLength(1);

    const splitter = document.createElement("blora-splitter") as HTMLElement & {
      position: number;
      setPosition(percent: number): void;
    };
    splitter.append(
      definition("blora-splitter-pane", "Left"),
      definition("blora-splitter-pane", "Right"),
    );
    document.body.appendChild(splitter);
    splitter.setPosition(60);
    expect(splitter.position).toBe(60);
    expect(splitter.querySelector("[role='separator']")).not.toBeNull();

    const tour = document.createElement("blora-tour") as HTMLElement & {
      start(): void;
      end(): void;
    };
    tour.append(definition("blora-tour-step", "First", { title: "One", description: "Intro" }));
    document.body.appendChild(tour);
    tour.start();
    expect(tour.hasAttribute("open")).toBe(true);
    expect(document.body.querySelector(".blora-tour__tooltip")).not.toBeNull();
    tour.end();
    expect(document.body.querySelector(".blora-tour__tooltip")).toBeNull();
  });

  it("owns all fixed composite status, data and navigation structures", () => {
    const alert = appendHost<HTMLElement>("blora-alert", {
      variant: "success",
      title: "Saved",
      description: "Data stored",
    });
    expect(alert.querySelector(".blora-alert__icon svg")).not.toBeNull();
    expect(alert.querySelector(".blora-alert__title")?.textContent).toBe("Saved");

    const banner = document.createElement("blora-banner");
    banner.setAttribute("title", "Version 2");
    banner.append(definition("blora-banner-action", "", { label: "Upgrade", value: "up" }));
    document.body.appendChild(banner);
    expect(banner.querySelectorAll(".blora-banner__actions button")).toHaveLength(1);

    const breadcrumb = document.createElement("blora-breadcrumb");
    breadcrumb.append(
      definition("blora-breadcrumb-item", "", { label: "Home", href: "#" }),
      definition("blora-breadcrumb-item", "", { label: "Current", current: "" }),
    );
    document.body.appendChild(breadcrumb);
    expect(breadcrumb.querySelectorAll(".blora-breadcrumb__sep")).toHaveLength(1);

    const chart = document.createElement("blora-chart-container");
    chart.setAttribute("title", "Visits");
    chart.appendChild(document.createElement("svg"));
    document.body.appendChild(chart);
    expect(chart.querySelector(".blora-chart__body svg")).not.toBeNull();

    const chat = appendHost<HTMLElement>("blora-chat", { author: "Alex", message: "Hello" });
    expect(chat.querySelector(".blora-chat__bubble")?.textContent).toBe("Hello");
    const comment = document.createElement("blora-comment");
    const author = document.createElement("span");
    author.setAttribute("slot", "author");
    author.textContent = "Rhedar";
    comment.append(author, document.createTextNode("Consistent"));
    document.body.appendChild(comment);
    expect(comment.querySelector(".blora-comment__body")?.textContent).toBe("Consistent");
    const empty = appendHost<HTMLElement>("blora-empty", { title: "Nothing" });
    expect(empty.querySelector(".blora-empty__title")?.textContent).toBe("Nothing");

    const mockup = document.createElement("blora-mockup");
    mockup.setAttribute("variant", "code");
    const mockupLine = definition("blora-mockup-line", "project ready", {
      prefix: "✓",
      tone: "success",
    });
    mockup.append(mockupLine);
    document.body.appendChild(mockup);
    expect(mockup.querySelector(".blora-mockup__line")?.getAttribute("data-prefix")).toBe("✓");
    expect(mockup.querySelector(".blora-mockup__line--success")?.textContent).toBe("project ready");

    const navbar = document.createElement("blora-navbar");
    navbar.append(
      definition("blora-navbar-link", "", { label: "Docs", current: "" }),
      definition("blora-navbar-action", "", { label: "Login", variant: "primary" }),
      definition("blora-navbar-tool", "Theme"),
    );
    document.body.appendChild(navbar);
    expect(navbar.querySelectorAll(".blora-navbar__link")).toHaveLength(1);
    expect(navbar.querySelectorAll(".blora-navbar__actions .blora-button")).toHaveLength(1);
    expect(navbar.querySelector(".blora-navbar__cta")?.textContent).toBe("Login");
    expect(navbar.querySelector(".blora-navbar__tools")?.textContent).toBe("Theme");
    const navbarSource = readFileSync(
      resolve(import.meta.dirname, "..", "src", "components", "navbar", "navbar.ts"),
      "utf8",
    );
    const brandPaths = [...navbarSource.matchAll(/"((?:M|L|Q)[0-9][^"]*)"/g)].map(
      ([, pathData]) => pathData,
    );
    expect(brandPaths.length).toBe(3);
    expect(
      [...navbar.querySelectorAll(".blora-brand-mark path")].map((path) => path.getAttribute("d")),
    ).toEqual(brandPaths);
    expect(
      [...navbar.querySelectorAll(".blora-brand-mark path")].map((path) =>
        path.getAttribute("fill-rule"),
      ),
    ).toEqual(["evenodd", "evenodd", "evenodd"]);

    const sidebarNav = document.createElement("blora-sidebar-nav") as HTMLElement & {
      value: string;
      select(value: string): void;
    };
    sidebarNav.setAttribute("label", "Components");
    const group = definition("blora-sidebar-nav-group", "", { label: "Data display" });
    group.append(
      definition("blora-sidebar-nav-link", "", {
        label: "Accordion",
        href: "#accordion",
        value: "accordion",
        current: "",
      }),
      definition("blora-sidebar-nav-link", "", {
        label: "Collapse",
        href: "#collapse",
        value: "collapse",
      }),
    );
    sidebarNav.appendChild(group);
    document.body.appendChild(sidebarNav);
    expect(sidebarNav.querySelector("nav")?.getAttribute("aria-label")).toBe("Components");
    expect(sidebarNav.querySelectorAll(".blora-sidebar-nav__group")).toHaveLength(1);
    expect(sidebarNav.querySelectorAll(".blora-sidebar-nav__link")).toHaveLength(2);
    expect(sidebarNav.value).toBe("accordion");
    sidebarNav.select("collapse");
    expect(
      sidebarNav.querySelector('.blora-sidebar-nav__link[aria-current="page"]')?.textContent,
    ).toBe("Collapse");
    let changeDetail: { href: string; value: string } | undefined;
    sidebarNav.addEventListener("blora-change", (event) => {
      changeDetail = (event as CustomEvent<{ href: string; value: string }>).detail;
    });
    sidebarNav.querySelector<HTMLAnchorElement>(".blora-sidebar-nav__link")!.click();
    expect(changeDetail).toEqual({ href: "#accordion", value: "accordion" });
    expect(sidebarNav.value).toBe("accordion");

    const result = appendHost<HTMLElement>("blora-result", { variant: "error", title: "Failed" });
    expect(result.querySelector(".blora-result__icon svg")).not.toBeNull();
    const timeline = document.createElement("blora-timeline");
    timeline.append(definition("blora-timeline-item", "", { time: "09:00", title: "Start" }));
    document.body.appendChild(timeline);
    expect(timeline.querySelectorAll(".blora-timeline__item")).toHaveLength(1);
  });

  it("timeline renders icon nodes and arbitrary child content", () => {
    const timeline = document.createElement("blora-timeline");
    const item = definition("blora-timeline-item", "", {
      time: "· 6个月前",
      icon: "message",
      "content-layout": "block",
    });
    const card = document.createElement("div");
    card.className = "blora-thread-comment__card";
    card.textContent = "comment card";
    item.append(card);
    timeline.append(item);
    document.body.appendChild(timeline);

    const dot = timeline.querySelector<HTMLElement>(".blora-timeline__dot--icon");
    expect(dot).not.toBeNull();
    expect(dot?.querySelector("svg")).not.toBeNull();
    expect(dot?.querySelector("svg")?.getAttribute("data-blora-icon")).toBe("message");
    const content = timeline.querySelector<HTMLElement>(".blora-timeline__content");
    expect(content?.textContent).toBe("comment card");
    expect(timeline.querySelector(".blora-timeline__row")?.getAttribute("data-layout")).toBe(
      "block",
    );
    expect(timeline.querySelector(".blora-thread-comment__card")).not.toBeNull();
  });
});
