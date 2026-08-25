import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";
import { createSectionNavigationHandler, SectionNavigation, sectionNavigation } from "./SectionNavigation";

describe("section navigation", () => {
  it("offers direct access to every public healthcare section", () => {
    expect(sectionNavigation.map(item => item.id)).toEqual(["home", "assistant", "hospitals", "medicines", "schemes", "asha", "ivr", "profile"]);
  });

  it("activates the requested section and exposes the compact item as current", () => {
    const navigate = vi.fn();
    createSectionNavigationHandler(navigate, "hospitals")();
    expect(navigate).toHaveBeenCalledWith("hospitals");

    const markup = renderToStaticMarkup(createElement(SectionNavigation, { activeId: "hospitals", onNavigate: navigate }));
    const compactMarkup = markup.match(/<nav[^>]*aria-label="Quick section navigation"[\s\S]*?<\/nav>/)?.[0] ?? "";
    expect(compactMarkup).toMatch(/aria-label="Hospitals"[^>]*aria-current="page"[^>]*data-active="true"/);
  });

  it("renders compact navigation labels from the selected language", () => {
    const markup = renderToStaticMarkup(createElement(SectionNavigation, { activeId: "assistant", language: "hi", onNavigate: vi.fn() }));
    expect(markup).toContain('aria-label="एआई सहायक"');
    expect(markup).toContain('aria-label="अस्पताल"');
  });
});
